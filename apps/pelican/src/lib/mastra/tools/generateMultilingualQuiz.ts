import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateText } from 'ai';
import { aiModel } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export const generateMultilingualQuiz = createTool({
  id: 'generateMultilingualQuiz',
  description:
    'Generates a 3-question verbal training quiz for a specific recipe and language, using actual recipe data from the database.',
  inputSchema: z.object({
    recipeId: z.string(),
    language: z.enum(['English', 'Spanish', 'Russian']),
    role:     z.enum(['prep', 'cook', 'server']).optional(),
  }),
  execute: async (context) => {
    const { recipeId, language, role = 'server' } = context;

    const recipe = await prisma.masterRecipes.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new Error(`Recipe ${recipeId} not found.`);

    const roleFocus = {
      prep:   'bulk yields, weights, and prep measurements',
      cook:   'cook temperatures, fire times, and assembly order',
      server: 'allergens, beer pairings, and the marketing story',
    }[role as 'prep' | 'cook' | 'server'];

    const { text } = await generateText({
      model: aiModel as any,
      prompt: `You are creating a verbal training quiz for restaurant kitchen staff.

Recipe: ${recipe.title}
Ingredients: ${JSON.stringify(recipe.ingredients)}
Prep Steps: ${JSON.stringify(recipe.prep_steps)}
Cook Steps: ${JSON.stringify(recipe.cook_steps)}
Technical Specs: ${recipe.technical_specs ?? 'N/A'}
Marketing Lore: ${recipe.marketing_lore ?? 'N/A'}
Allergens: ${JSON.stringify(recipe.allergens)}
Condiments: ${JSON.stringify(recipe.condiments)}

Role focus: ${roleFocus}
Language: ${language}

Generate exactly 3 quiz questions focused on the role above.
Return ONLY valid JSON in this shape:
[
  { "question": "...", "expected_answer": "...", "language": "${language}" },
  { "question": "...", "expected_answer": "...", "language": "${language}" },
  { "question": "...", "expected_answer": "...", "language": "${language}" }
]`,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI did not return a valid quiz array.');
    const quiz = JSON.parse(jsonMatch[0]);

    return { success: true, recipeTitle: recipe.title, language, role, quiz };
  },
});

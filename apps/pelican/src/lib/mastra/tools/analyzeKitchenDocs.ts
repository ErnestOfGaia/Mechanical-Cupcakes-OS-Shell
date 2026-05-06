import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateText } from 'ai';
import { aiModel } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export const analyzeKitchenDocs = createTool({
  id: 'analyzeKitchenDocs',
  description:
    'Analyzes kitchen document images using multimodal vision. Categorizes content as Technical Recipe or Marketing Lore, then merges and saves to MasterRecipes.',
  inputSchema: z.object({
    imageUrls: z.array(z.string().url()).min(1),
  }),
  execute: async (context) => {
    const { imageUrls } = context;

    const imageContent = imageUrls.map(url => ({
      type: 'image' as const,
      image: url,
    }));

    const { text } = await generateText({
      model: aiModel as any,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `You are analyzing kitchen documents for a restaurant.
Extract all information and return ONLY valid JSON in this exact shape:
{
  "title": "dish name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "prep_steps": ["step 1", "step 2"],
  "cook_steps": ["step 1", "step 2"],
  "technical_specs": "weights, temps, times as a string (or null)",
  "marketing_lore": "story/description for servers (or null)",
  "allergens": ["Gluten", "Dairy"],
  "condiments": ["sauce 1"],
  "category": "Technical" or "Marketing"
}
If multiple documents are provided, merge them into one unified record.`,
            },
          ],
        },
      ],
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON.');
    const parsed = JSON.parse(jsonMatch[0]);

    for (const url of imageUrls) {
      await prisma.scrapbook.create({
        data: { image_url: url, raw_text: text, category: parsed.category ?? 'Technical' },
      });
    }

    const recipe = await prisma.masterRecipes.create({
      data: {
        title:           parsed.title,
        ingredients:     parsed.ingredients ?? [],
        prep_steps:      parsed.prep_steps  ?? [],
        cook_steps:      parsed.cook_steps  ?? [],
        technical_specs: parsed.technical_specs ?? null,
        marketing_lore:  parsed.marketing_lore  ?? null,
        allergens:       parsed.allergens   ?? [],
        condiments:      parsed.condiments  ?? [],
        status:          'draft',
      },
    });

    return { success: true, recipeId: recipe.id, title: recipe.title };
  },
});

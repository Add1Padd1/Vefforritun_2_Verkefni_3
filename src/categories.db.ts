import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { get } from 'http';
const CategorySchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z
    .string()
    .min(3, 'title must be at least 3 letters')
    .max(10024, 'title must be at most 1024 letters'),
});

const CategoryToCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'title must be at least 3 letters')
    .max(10024, 'title must be at most 1024 letters'),
});

const CategoryToUpdateSchema = z.object({
  title: z
    .string()
    .min(3, 'title must be at least 3 letters')
    .max(10024, 'title must be at most 1024 letters'),
});

type Category = z.infer<typeof CategorySchema>;
type CategoryToCreate = z.infer<typeof CategoryToCreateSchema>;
type CategoryToDelete = z.infer<typeof CategorySchema>;
type CategoryToUpdate = z.infer<typeof CategoryToUpdateSchema>;
const mockCategories: Array<Category> = [
  {
    id: 1,
    slug: 'html',
    title: 'HTML',
  },
  {
    id: 2,
    slug: 'css',
    title: 'CSS',
  },
  {
    id: 3,
    slug: 'java',
    title: 'JAVA',
  },
];
const prisma = new PrismaClient();

export async function getCategories(
  limit = 10,
  offset = 0
): Promise<Array<Category>> {
  const categories = await prisma.categories.findMany();
  console.log('categories :>> ', categories);
  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const cat = await prisma.categories.findUnique({
    where: {
      slug: slug,
    },
  });
  return cat ?? null;
}

export function validateCategory(categoryToValidate: unknown) {
  const result = CategoryToCreateSchema.safeParse(categoryToValidate);

  return result;
}
export function validateUpdatedCategory(categoryToValidate: unknown) {
  const result = CategoryToUpdateSchema.safeParse(categoryToValidate);

  return result;
}

export async function createCategory(
  categoryToCreate: CategoryToCreate
): Promise<Category> {
  console.log('categoryToCreate :>> ', categoryToCreate.title);
  const createdCategory = await prisma.categories.create({
    data: {
      title: categoryToCreate.title,
      slug: categoryToCreate.title.toLowerCase().replace(' ', '-'),
    },
  });

  return createdCategory;
}
// Það sem ég gerði til að deletea category...
export async function deleteCategory(
  categoryToDelete: CategoryToDelete
): Promise<Category> {
  if (!categoryToDelete) {
    throw new Error('Category not found');
  }
  const deletedCategory = await prisma.categories.delete({
    where: {
      slug: categoryToDelete?.slug,
    },
  });
  return deletedCategory;
}

export async function updateCategory(
  categoryToUpdate: CategoryToUpdate,
  slug: string
): Promise<Category> {
  console.log('categoryToUpdate :>> ', categoryToUpdate.title);
  console.log('slug :>> ', slug);
  if (!categoryToUpdate) {
    throw new Error('Category not found');
  }
  const updatedCategory = await prisma.categories.update({
    where: {
      slug: slug,
    },
    data: {
      title: categoryToUpdate?.title,
      slug: categoryToUpdate?.title.toLowerCase().replace(' ', '-'),
    },
  });
  console.log('updatedCategory :>> ', updatedCategory);
  return updatedCategory;
}

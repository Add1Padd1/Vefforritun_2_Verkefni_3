import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import {
  createCategory,
  getCategories,
  getCategory,
  validateCategory,
  deleteCategory,
} from './categories.db.js';

const app = new Hono();

app.get('/', (c) => {
  const data = {
    name: 'John Doe',
    age: 30,
  };
  return c.json(data);
});

app.get('/categories', async (c) => {
  const categories = await getCategories();
  return c.json(categories);
});

app.get('/categories/:slug', (c) => {
  const slug = c.req.param('slug');

  // Validate á hámarkslengd á slug
  if (slug.length > 100) {
    return c.json({ message: 'Slug is too long' }, 400);
  }
  const category = getCategory(slug);
  if (!category) {
    return c.json({ message: 'Category not found' }, 404);
  }

  return c.json(category);
});
app.post('/categories', async (c) => {
  let categoryToCreate: unknown;
  try {
    categoryToCreate = await c.req.json();
    console.log('Þetta er category', categoryToCreate);
  } catch (error) {
    return c.json({ error: 'invalid json' }, 400);
  }
  const validCategory = validateCategory(categoryToCreate);
  if (!validCategory.success) {
    return c.json(
      { error: 'invalid data', errors: validCategory.error.flatten() },
      400
    );
  }
  const createdCategory = await createCategory(validCategory.data);
  return c.json(createdCategory, 201);
});
// Það sem ég gerði til að deletea category...
app.delete('/categories/:slug', async (c) => {
  const slug = c.req.param('slug');
  console.log(slug);
  const category = getCategory(slug);
  console.log(category);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }
  const deletedCategory = await deleteCategory(category);
  return c.json(deletedCategory, 401);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

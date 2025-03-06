import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import {
  createCategory,
  getCategories,
  getCategory,
  validateCategory,
  validateUpdatedCategory,
  deleteCategory,
  updateCategory,
} from './categories.db.js';

const app = new Hono();

app.get('/', (c) => {
  const data = {
    name: 'Categories',
    description: 'API to manage categories',
    _links: {
      self: {
        href: '/',
        method: 'GET',
      },
      categories: {
        href: '/categories',
        method: 'GET',
      },
    },
  };
  return c.json(data);
});

app.get('/categories', async (c) => {
  const categories = await getCategories();
  return c.json(categories);
});

app.get('/categories/:slug', async (c) => {
  const slug = c.req.param('slug');

  // Validate á hámarkslengd á slug
  if (slug.length > 100) {
    return c.json({ message: 'Slug is too long' }, 400);
  }
  const category = await getCategory(slug);
  if (!category) {
    return c.json({ message: 'Category not found' }, 404);
  }
  console.log('category :>> ', category);
  return c.json(category);
});
app.post('/categories', async (c) => {
  let categoryToCreate: unknown;
  try {
    categoryToCreate = await c.req.json();
    console.log('Þetta er category', categoryToCreate);
    // eslint-disable-next-line
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
  console.log('createdCategory :>> ', createdCategory);
  return c.json(createdCategory, 201);
});
// Það sem ég gerði til að deletea category...
app.delete('/category/:slug', async (c) => {
  const slug = c.req.param('slug');
  console.log(slug);
  const category = await getCategory(slug);
  console.log(category);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }
  try {
    await deleteCategory(category);
    return c.body(null, 204);
    // eslint-disable-next-line
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Það sem ég gerði til að updatea category...
app.patch('/category/:slug', async (c) => {
  const slug = c.req.param('slug');
  const category = await getCategory(slug);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }
  let categoryToUpdate: unknown;
  try {
    categoryToUpdate = await c.req.json();
    // eslint-disable-next-line
  } catch (error) {
    return c.json({ error: 'invalid json' }, 400);
  }
  const validCategory = validateUpdatedCategory(categoryToUpdate);
  console.log('validCategory :>> ', validCategory);
  if (!validCategory.success) {
    return c.json(
      { error: 'invalid data', errors: validCategory.error.flatten() },
      400
    );
  }
  console.log('Er kominn hérna');
  const updated = await updateCategory(validCategory.data, category);
  console.log('updated :>> ', updated);
  return c.json(updated, 200);

  /* return c.json({ error: 'Internal server error' }, 500); */
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

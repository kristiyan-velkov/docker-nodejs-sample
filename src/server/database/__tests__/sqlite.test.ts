import { TodoItem } from '@/shared/types/todo.js';
import { promises as fs } from 'fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SqliteDatabase } from '../sqlite.js';

const TEST_DB_LOCATION = '/tmp/test-todo.db';

const SAMPLE_ITEM: TodoItem = {
  id: '7aef3d7c-d301-4846-8358-2a91ec9d6be3',
  name: 'Test Todo Item',
  completed: false,
};

describe('SqliteDatabase', () => {
  let db: SqliteDatabase;

  beforeEach(async () => {
    // Clean up any existing test database
    try {
      await fs.unlink(TEST_DB_LOCATION);
    } catch {
      // File doesn't exist, that's fine
    }
    
    db = new SqliteDatabase(TEST_DB_LOCATION);
  });

  afterEach(async () => {
    if (db) {
      await db.teardown();
    }
    
    // Clean up test database
    try {
      await fs.unlink(TEST_DB_LOCATION);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  it('should initialize correctly', async () => {
    await expect(db.init()).resolves.not.toThrow();
  });

  it('should create database file on initialization', async () => {
    await db.init();
    
    const stats = await fs.stat(TEST_DB_LOCATION);
    expect(stats.isFile()).toBe(true);
  });

  it('should return empty array when no items exist', async () => {
    await db.init();
    
    const items = await db.getItems();
    expect(items).toEqual([]);
    expect(items.length).toBe(0);
  });

  it('should store and retrieve items correctly', async () => {
    await db.init();

    await db.storeItem(SAMPLE_ITEM);

    const items = await db.getItems();
    expect(items.length).toBe(1);
    expect(items[0]).toEqual(SAMPLE_ITEM);
  });

  it('should get a single item by id', async () => {
    await db.init();
    await db.storeItem(SAMPLE_ITEM);

    const item = await db.getItem(SAMPLE_ITEM.id);
    expect(item).toEqual(SAMPLE_ITEM);
  });

  it('should return null when getting non-existent item', async () => {
    await db.init();

    const item = await db.getItem('non-existent-id');
    expect(item).toBeNull();
  });

  it('should update an existing item correctly', async () => {
    await db.init();
    await db.storeItem(SAMPLE_ITEM);

    const updates = { completed: true, name: 'Updated Todo' };
    await db.updateItem(SAMPLE_ITEM.id, updates);

    const updatedItem = await db.getItem(SAMPLE_ITEM.id);
    expect(updatedItem).toEqual({
      ...SAMPLE_ITEM,
      ...updates,
    });
  });

  it('should update only specified fields', async () => {
    await db.init();
    await db.storeItem(SAMPLE_ITEM);

    await db.updateItem(SAMPLE_ITEM.id, { completed: true });

    const updatedItem = await db.getItem(SAMPLE_ITEM.id);
    expect(updatedItem?.completed).toBe(true);
    expect(updatedItem?.name).toBe(SAMPLE_ITEM.name); // Should remain unchanged
  });

  it('should handle empty update gracefully', async () => {
    await db.init();
    await db.storeItem(SAMPLE_ITEM);

    await db.updateItem(SAMPLE_ITEM.id, {});

    const item = await db.getItem(SAMPLE_ITEM.id);
    expect(item).toEqual(SAMPLE_ITEM); // Should remain unchanged
  });

  it('should remove an existing item', async () => {
    await db.init();
    await db.storeItem(SAMPLE_ITEM);

    await db.removeItem(SAMPLE_ITEM.id);

    const items = await db.getItems();
    expect(items.length).toBe(0);
    
    const item = await db.getItem(SAMPLE_ITEM.id);
    expect(item).toBeNull();
  });

  it('should handle multiple items correctly', async () => {
    await db.init();

    const items: TodoItem[] = [
      { id: '1', name: 'First Todo', completed: false },
      { id: '2', name: 'Second Todo', completed: true },
      { id: '3', name: 'Third Todo', completed: false },
    ];

    // Store all items
    for (const item of items) {
      await db.storeItem(item);
    }

    const retrievedItems = await db.getItems();
    expect(retrievedItems.length).toBe(3);
    
    // Items should be ordered by name (SQLite query orders them)
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
    expect(retrievedItems).toEqual(sortedItems);
  });

  it('should handle boolean conversion correctly', async () => {
    await db.init();
    
    const completedItem: TodoItem = { ...SAMPLE_ITEM, completed: true };
    await db.storeItem(completedItem);

    const retrievedItem = await db.getItem(completedItem.id);
    expect(retrievedItem?.completed).toBe(true);
    expect(typeof retrievedItem?.completed).toBe('boolean');
  });

  it('should handle database errors gracefully', async () => {
    // Test without initializing database
    await expect(db.getItems()).rejects.toThrow('Database not initialized');
    await expect(db.getItem('test-id')).rejects.toThrow('Database not initialized');
    await expect(db.storeItem(SAMPLE_ITEM)).rejects.toThrow('Database not initialized');
    await expect(db.updateItem('test-id', {})).rejects.toThrow('Database not initialized');
    await expect(db.removeItem('test-id')).rejects.toThrow('Database not initialized');
  });
});

import { EntityManager } from 'typeorm';
import { Role } from '../enums';
import { generateUserId } from './user-id.util';

describe('generateUserId', () => {
  it.each([
    [Role.RESIDENT, 'RES'],
    [Role.MANAGER, 'MGR'],
    [Role.GUARD, 'GRD'],
    [Role.MAINTENANCE, 'MNT'],
    [Role.ACCOUNTANT, 'ACC'],
  ])('uses the role prefix for %s', async (role, prefix) => {
    const query = jest.fn().mockResolvedValueOnce([{ value: '1' }]);
    const manager = { query } as unknown as EntityManager;

    await expect(generateUserId(manager, role)).resolves.toBe(`${prefix}-01`);
  });

  it('increments and expands the serial beyond two digits', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ value: '100' }]);
    const manager = { query } as unknown as EntityManager;

    await expect(generateUserId(manager, Role.RESIDENT)).resolves.toBe(
      'RES-100',
    );
  });
});

import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { generatePrefixedId } from '../../common/utils/user-id.util';

const TABLE_PREFIXES: Record<string, string> = {
  blocks: 'BLK',
  flats: 'FLT',
  complaints: 'CMP',
  visitors: 'VIS',
  bills: 'BIL',
  payments: 'PAY',
  amenities: 'AMN',
  amenity_slots: 'AMS',
  bookings: 'BKG',
  announcements: 'ANN',
  announcement_targets: 'ANT',
  notifications: 'NTF',
  audit_logs: 'AUD',
  billing_config: 'BCF',
  otp_tokens: 'OTP',
  refresh_tokens: 'RFT',
};

@EventSubscriber()
export class ReadableIdSubscriber implements EntitySubscriberInterface {
  private readonly insertQueues = new WeakMap<object, Promise<void>>();

  async beforeInsert(event: InsertEvent<Record<string, unknown>>) {
    if (!event.entity || event.entity.id) return;
    if (!event.metadata.findColumnWithPropertyName('id')) return;

    const prefix = TABLE_PREFIXES[event.metadata.tableName];
    if (!prefix) {
      throw new Error(
        `No readable ID prefix configured for table ${event.metadata.tableName}`,
      );
    }

    const queueKey = event.queryRunner;
    const previousInsert = this.insertQueues.get(queueKey) ?? Promise.resolve();
    let releaseInsert!: () => void;
    const currentInsert = new Promise<void>((resolve) => {
      releaseInsert = resolve;
    });
    const queueTail = previousInsert.then(() => currentInsert);
    this.insertQueues.set(queueKey, queueTail);

    await previousInsert;
    try {
      event.entity.id = await generatePrefixedId(event.manager, prefix);
    } finally {
      releaseInsert();
      if (this.insertQueues.get(queueKey) === queueTail) {
        this.insertQueues.delete(queueKey);
      }
    }
  }
}

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter(
      (key) => key[0] !== '_' && key !== 'constructor',
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof typeof this];
        if (
          model &&
          typeof model === 'object' &&
          'deleteMany' in model &&
          typeof model.deleteMany === 'function'
        ) {
          return model.deleteMany();
        }
      }),
    );
  }
}

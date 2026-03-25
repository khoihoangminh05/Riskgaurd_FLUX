import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertSeverity } from '../entities/alert.entity';

@Injectable()
export class AlertService {
    constructor(
        @InjectRepository(Alert)
        private readonly alertRepo: Repository<Alert>,
    ) {}

    async getAlerts(companyId: string): Promise<Alert[]> {
        return this.alertRepo.find({
            where: { companyId },
            order: { createdAt: 'DESC' },
        });
    }

    async createAlert(companyId: string, severity: AlertSeverity, message: string): Promise<Alert> {
        const alert = this.alertRepo.create({
            companyId,
            severity,
            message,
            isResolved: false,
        });
        return await this.alertRepo.save(alert);
    }

    async deleteAlert(id: string): Promise<void> {
        await this.alertRepo.delete(id);
    }

    async toggleImportant(id: string): Promise<Alert> {
        const alert = await this.alertRepo.findOne({ where: { id } });
        if (!alert) {
            throw new Error('Alert not found');
        }
        alert.isImportant = !alert.isImportant;
        return await this.alertRepo.save(alert);
    }
}

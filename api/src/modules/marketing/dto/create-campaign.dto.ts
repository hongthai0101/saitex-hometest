import { IsEnum, IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignPlatform, CampaignObjective, CampaignStatus } from '../entities/campaign.entity';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: CampaignPlatform, description: 'Marketing platform' })
  @IsEnum(CampaignPlatform)
  platform: CampaignPlatform;

  @ApiProperty({ enum: CampaignObjective, description: 'Campaign objective' })
  @IsEnum(CampaignObjective)
  objective: CampaignObjective;

  @ApiProperty({ description: 'Campaign budget', minimum: 0 })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiProperty({ description: 'Daily budget', minimum: 0 })
  @IsNumber()
  @Min(0)
  dailyBudget: number;

  @ApiProperty({ description: 'Campaign start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Campaign end date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Campaign description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Targeting options', required: false })
  @IsOptional()
  @IsObject()
  targeting?: {
    demographics?: {
      ageMin?: number;
      ageMax?: number;
      genders?: string[];
    };
    interests?: string[];
    behaviors?: string[];
    locations?: {
      countries?: string[];
      regions?: string[];
      cities?: string[];
    };
    customAudiences?: string[];
    lookalikes?: string[];
  };

  @ApiProperty({ description: 'Creative assets', required: false })
  @IsOptional()
  @IsObject()
  creativeAssets?: {
    images?: {
      url: string;
      width: number;
      height: number;
      alt?: string;
    }[];
    videos?: {
      url: string;
      thumbnail?: string;
      duration?: number;
    }[];
    headlines?: string[];
    descriptions?: string[];
    callToActions?: string[];
  };

  @ApiProperty({ description: 'Platform-specific data', required: false })
  @IsOptional()
  @IsObject()
  platformSpecificData?: Record<string, any>;
}
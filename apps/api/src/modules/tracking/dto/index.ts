import { IsString, IsUrl, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTrackingLinkDto {
  @ApiProperty({ example: 'Summer Sale Campaign' })
  @IsString() @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'https://wa.me/971501234567' })
  @IsUrl()
  destinationUrl!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() utmSource?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() utmMedium?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() utmCampaign?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() utmContent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() utmTerm?: string;
}

export class UpdateTrackingLinkDto extends PartialType(CreateTrackingLinkDto) {}

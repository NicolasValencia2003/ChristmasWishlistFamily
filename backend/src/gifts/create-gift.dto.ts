import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import { MSG } from '../common/messages';

const clean = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

/** Like `clean`, but blank/missing values become null (optional fields). */
const cleanOptional = (fn: (v: string) => string) => ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const v = fn(value);
  return v === '' ? null : v;
};

export class CreateGiftDto {
  @Transform(clean)
  @IsString({ message: MSG.personNameText })
  @IsNotEmpty({ message: MSG.personNameRequired })
  @MaxLength(60, { message: MSG.personNameMax })
  personName: string;

  @Transform(clean)
  @IsString({ message: MSG.giftNameText })
  @IsNotEmpty({ message: MSG.giftNameRequired })
  @MaxLength(60, { message: MSG.giftNameMax })
  giftName: string;

  // A link, a store name, or both. Validate the link when it's given, or when the store is missing too.
  @Transform(cleanOptional((v) => v.trim()))
  @ValidateIf((o: CreateGiftDto) => o.url !== null || o.store === null)
  @IsNotEmpty({ message: MSG.linkOrStoreRequired })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true, require_valid_protocol: true },
    { message: MSG.urlInvalid },
  )
  @MaxLength(2000, { message: MSG.urlMax })
  url: string | null = null;

  @Transform(cleanOptional((v) => v.trim().replace(/\s+/g, ' ')))
  @IsOptional()
  @IsString({ message: MSG.storeText })
  @MaxLength(60, { message: MSG.storeMax })
  store: string | null = null;
}

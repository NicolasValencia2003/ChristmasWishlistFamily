import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { MSG } from '../common/messages';

const clean = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

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

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: MSG.urlRequired })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true, require_valid_protocol: true },
    { message: MSG.urlInvalid },
  )
  @MaxLength(2000, { message: MSG.urlMax })
  url: string;
}

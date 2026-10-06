import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// The contact form. Same rules and messages as the Laravel site, plus upper
// limits on the email and message (Laravel had none) and a honeypot.
export class ContactRequest {
  @Transform(trim)
  @IsNotEmpty({ message: 'The name field is required.' })
  @IsString({ message: 'The name must be a string.' })
  @MaxLength(150, {
    message: 'The name must not be greater than 150 characters.',
  })
  name!: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'The email field is required.' })
  @IsString({ message: 'The email must be a string.' })
  @IsEmail({}, { message: 'The email must be a valid email address.' })
  @MaxLength(254, {
    message: 'The email must not be greater than 254 characters.',
  })
  email!: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'The body field is required.' })
  @IsString({ message: 'The body must be a string.' })
  @MaxLength(5000, {
    message: 'The body must not be greater than 5000 characters.',
  })
  body!: string;

  // Honeypot: hidden from people by the frontend, so only bots fill it in.
  @IsOptional()
  @IsString()
  website?: string;
}

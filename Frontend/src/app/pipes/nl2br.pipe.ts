import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br'
})
export class Nl2brPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Convertir saltos de línea a <br>
    const html = value.replace(/\n/g, '<br>');
    
    // Retornar HTML sanitizado
    return this.sanitizer.sanitize(1, html) || '';
  }
}
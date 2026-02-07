import { Component, OnInit } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {
  private readonly EMAIL_JS_CONFIG = {
    publicKey: environment.emailjs.publicKey,
    serviceId: environment.emailjs.serviceId,
    templateId: environment.emailjs.templateId
  };

  isSubmitting = false;
  showSuccess = false;
  showError = false;

  ngOnInit() {
  }

  onSubmit(event: Event) {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    this.isSubmitting = true;
    this.hideMessages();

    emailjs.sendForm(
      this.EMAIL_JS_CONFIG.serviceId,
      this.EMAIL_JS_CONFIG.templateId,
      form,
      this.EMAIL_JS_CONFIG.publicKey 
    )
    .then(
      (response) => {
        this.showSuccessMessage();
        form.reset();
        form.classList.remove('was-validated');
      },
      (error) => {
        console.error('Error al enviar email:', error);
        this.showErrorMessage();
      }
    )
    .finally(() => {
      this.isSubmitting = false;
    });
  }

  private showSuccessMessage() {
    this.showSuccess = true;
    this.showError = false;
    
    setTimeout(() => {
      this.showSuccess = false;
    }, 5000);

    this.scrollToMessage('successMessage');
  }

  private showErrorMessage() {
    this.showError = true;
    this.showSuccess = false;
    
    setTimeout(() => {
      this.showError = false;
    }, 5000);

    this.scrollToMessage('errorMessage');
  }

  private hideMessages() {
    this.showSuccess = false;
    this.showError = false;
  }

  private scrollToMessage(elementId: string) {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

interface RegistrationData {
  // Paso 1
  firstName: string;
  lastName: string;
  birthDate: string;
  document: string;
  email: string;
  password: string;
  
  // Paso 2
  city: string;
  province: string;
  address: string;
  phone?: string;
  occupation?: string;
  howKnowClub?: string;
  
  // Paso 3
  paymentMethod: string;
  mercadopagoType?: string;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  
  registrationForm!: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 3;
  selectedPaymentMethod: string = '';
  showMercadopagoOptions: boolean = false;
  isSubmitting: boolean = false;
  registrationComplete: boolean = false;

  // Opciones para los selects
  provinces: string[] = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
    'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
    'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  howKnowOptions = [
    { value: 'redes-sociales', label: 'Redes Sociales' },
    { value: 'recomendacion', label: 'Recomendación de amigos/familiares' },
    { value: 'publicidad', label: 'Publicidad' },
    { value: 'eventos', label: 'Eventos del club' },
    { value: 'otro', label: 'Otro' }
  ];

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.updateProgress();
    this.updateStepIndicators();
  }

  private createForm(): void {
    this.registrationForm = this.formBuilder.group({
      // Paso 1: Datos Personales
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', [Validators.required, this.ageValidator]],
      document: ['', [Validators.required, this.documentValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      
      // Paso 2: Información Adicional
      city: ['', Validators.required],
      province: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      occupation: [''],
      howKnowClub: [''],
      
      // Paso 3: Método de Pago
      paymentMethod: ['', Validators.required],
      mercadopagoType: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  // Validadores personalizados
  private ageValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    return age >= 18 ? null : { 'ageInvalid': { value: control.value } };
  }

  private documentValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const docRegex = /^\d{7,8}$/;
    return docRegex.test(control.value) ? null : { 'documentInvalid': { value: control.value } };
  }

  // Navegación entre pasos
  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStep();
      } else {
        this.submitForm();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStep();
    }
  }

  private updateStep(): void {
    this.updateProgress();
    this.updateStepIndicators();
    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualización de UI
  updateProgress(): void {
    const progressPercentage = (this.currentStep / this.totalSteps) * 100;
    setTimeout(() => {
      const progressFill = document.getElementById('progressFill');
      if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
      }
    });
  }

  updateStepIndicators(): void {
    setTimeout(() => {
      const steps = document.querySelectorAll('.step');
      steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepNumberElement = step.querySelector('.step-number');
        
        step.classList.remove('active', 'completed');
        
        if (stepNumber < this.currentStep) {
          step.classList.add('completed');
          if (stepNumberElement) {
            stepNumberElement.innerHTML = '<i class="fas fa-check"></i>';
          }
        } else if (stepNumber === this.currentStep) {
          step.classList.add('active');
          if (stepNumberElement) {
            stepNumberElement.innerHTML = stepNumber.toString();
          }
        } else {
          if (stepNumberElement) {
            stepNumberElement.innerHTML = stepNumber.toString();
          }
        }
      });
    });
  }

  // Validación
  private validateCurrentStep(): boolean {
    let isValid = true;

    switch (this.currentStep) {
      case 1:
        isValid = this.validateStep1();
        break;
      case 2:
        isValid = this.validateStep2();
        break;
      case 3:
        isValid = this.validateStep3();
        break;
    }

    if (!isValid) {
      this.markFormGroupTouched();
    }

    return isValid;
  }

  private validateStep1(): boolean {
    const step1Fields = ['firstName', 'lastName', 'birthDate', 'document', 'email', 'password'];
    return this.validateFields(step1Fields);
  }

  private validateStep2(): boolean {
    const step2Fields = ['city', 'province', 'address'];
    return this.validateFields(step2Fields);
  }

  private validateStep3(): boolean {
    if (!this.selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return false;
    }

    if (this.selectedPaymentMethod === 'mercadopago') {
      const mercadopagoType = this.registrationForm.get('mercadopagoType')?.value;
      if (!mercadopagoType) {
        alert('Por favor selecciona un tipo de pago para Mercado Pago');
        return false;
      }
    }

    const acceptTermsField = ['acceptTerms'];
    return this.validateFields(acceptTermsField);
  }

  private validateFields(fieldNames: string[]): boolean {
    let isValid = true;
    
    fieldNames.forEach(fieldName => {
      const field = this.registrationForm.get(fieldName);
      if (field && field.invalid) {
        field.markAsTouched();
        isValid = false;
      }
    });
    
    return isValid;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Manejo de métodos de pago
  selectPaymentMethod(paymentMethod: string): void {
    this.selectedPaymentMethod = paymentMethod;
    this.registrationForm.patchValue({ paymentMethod });
    
    // Actualizar UI
    setTimeout(() => {
      document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
      });
      
      const selectedOption = document.querySelector(`[data-payment="${paymentMethod}"]`);
      if (selectedOption) {
        selectedOption.classList.add('selected');
      }
    });

    // Mostrar/ocultar opciones de Mercado Pago
    this.showMercadopagoOptions = paymentMethod === 'mercadopago';
    
    if (paymentMethod !== 'mercadopago') {
      this.registrationForm.patchValue({ mercadopagoType: '' });
    }
  }

  // Utilidades para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (errors['email']) {
      return 'Ingresa un correo electrónico válido';
    }
    
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    }
    
    if (errors['ageInvalid']) {
      return 'Debes ser mayor de 18 años';
    }
    
    if (errors['documentInvalid']) {
      return 'Ingresa un documento válido (7-8 dígitos)';
    }
    
    if (errors['requiredTrue']) {
      return 'Debes aceptar los términos y condiciones';
    }

    return 'Campo inválido';
  }

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  get isFirstStep(): boolean {
    return this.currentStep === 1;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  get nextButtonText(): string {
    return this.isLastStep ? 'Finalizar Registro' : 'Siguiente';
  }

  get nextButtonIcon(): string {
    return this.isLastStep ? 'fas fa-check' : 'fas fa-arrow-right';
  }

  // Envío del formulario
  async submitForm(): Promise<void> {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.collectFormData();
      console.log('Datos del formulario:', formData);
      
      // Simular petición HTTP
      await this.simulateRegistrationRequest(formData);
      
      this.registrationComplete = true;
      this.updateProgress(); // Completar barra de progreso
      
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Hubo un error al procesar tu registro. Por favor intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private collectFormData(): RegistrationData {
    const formValue = this.registrationForm.value;
    return {
      ...formValue,
      paymentMethod: this.selectedPaymentMethod
    };
  }

  private async simulateRegistrationRequest(data: RegistrationData): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Registro enviado:', data);
        resolve();
      }, 2000);
    });
  }

  // Reiniciar formulario
  resetForm(): void {
    this.registrationForm.reset();
    this.currentStep = 1;
    this.selectedPaymentMethod = '';
    this.showMercadopagoOptions = false;
    this.registrationComplete = false;
    this.isSubmitting = false;
    this.updateStep();
  }

  goHome(): void {
    // Navegar a la página principal
    // this.router.navigate(['/']);
    window.location.href = '/';
  }
}
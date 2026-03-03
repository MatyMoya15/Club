import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from 'src/app/service/auth.service';

interface RegistrationData
{
  firstName: string;
  lastName: string;
  birthDate: string;
  document: string;
  email: string;
  password: string;

  city: string;
  province: string;
  address: string;
  phone?: string;
  occupation?: string;
  howKnowClub?: string;

  paymentMethod: string;
  mercadopagoType?: string;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit
{

  registrationForm!: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 3;
  selectedPaymentMethod: string = '';
  showMercadopagoOptions: boolean = false;
  isSubmitting: boolean = false;
  registrationComplete: boolean = false;
  errorMessage: string = '';

  // Opciones para los selects
  provinces: string[] = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
    'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
    'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  )
  {
    this.createForm();
  }

  ngOnInit(): void
  {
    this.updateProgress();
    this.updateStepIndicators();
  }

  private createForm(): void
  {
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

      // Paso 3: Método de Pago
      paymentMethod: ['', Validators.required],
    });
  }

  private ageValidator(control: AbstractControl): { [key: string]: any } | null
  {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return age >= 18 ? null : { 'ageInvalid': { value: control.value } };
  }

  private documentValidator(control: AbstractControl): { [key: string]: any } | null
  {
    if (!control.value) return null;

    const docRegex = /^\d{7,8}$/;
    return docRegex.test(control.value) ? null : { 'documentInvalid': { value: control.value } };
  }

  nextStep(): void
  {
    if (this.validateCurrentStep())
    {
      if (this.currentStep < this.totalSteps)
      {
        this.currentStep++;
        this.updateStep();
      } else
      {
        this.submitForm();
      }
    }
  }

  prevStep(): void
  {
    if (this.currentStep > 1)
    {
      this.currentStep--;
      this.updateStep();
    }
  }

  private updateStep(): void
  {
    this.updateProgress();
    this.updateStepIndicators();
    this.scrollToTop();
  }

  private scrollToTop(): void
  {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateProgress(): void
  {
    const progressPercentage = (this.currentStep / this.totalSteps) * 100;
    setTimeout(() =>
    {
      const progressFill = document.getElementById('progressFill');
      if (progressFill)
      {
        progressFill.style.width = `${progressPercentage}%`;
      }
    });
  }

  updateStepIndicators(): void
  {
    setTimeout(() =>
    {
      const steps = document.querySelectorAll('.step');
      steps.forEach((step, index) =>
      {
        const stepNumber = index + 1;
        const stepNumberElement = step.querySelector('.step-number');

        step.classList.remove('active', 'completed');

        if (stepNumber < this.currentStep)
        {
          step.classList.add('completed');
          if (stepNumberElement)
          {
            stepNumberElement.innerHTML = '<i class="fas fa-check"></i>';
          }
        } else if (stepNumber === this.currentStep)
        {
          step.classList.add('active');
          if (stepNumberElement)
          {
            stepNumberElement.innerHTML = stepNumber.toString();
          }
        } else
        {
          if (stepNumberElement)
          {
            stepNumberElement.innerHTML = stepNumber.toString();
          }
        }
      });
    });
  }

  // Validación
  private validateCurrentStep(): boolean
  {
    let isValid = true;

    switch (this.currentStep)
    {
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

    if (!isValid)
    {
      this.markFormGroupTouched();
    }

    return isValid;
  }

  private validateStep1(): boolean
  {
    const step1Fields = ['firstName', 'lastName', 'birthDate', 'document', 'email', 'password'];
    return this.validateFields(step1Fields);
  }

  private validateStep2(): boolean
  {
    const step2Fields = ['city', 'province', 'address'];
    return this.validateFields(step2Fields);
  }

  private validateStep3(): boolean
  {
    if (!this.selectedPaymentMethod)
    {
      alert('Por favor selecciona un método de pago');
      return false;
    }
    return true;
  }

  private validateFields(fieldNames: string[]): boolean
  {
    let isValid = true;

    fieldNames.forEach(fieldName =>
    {
      const field = this.registrationForm.get(fieldName);
      if (field && field.invalid)
      {
        field.markAsTouched();
        isValid = false;
      }
    });

    return isValid;
  }

  private markFormGroupTouched(): void
  {
    Object.keys(this.registrationForm.controls).forEach(key =>
    {
      const control = this.registrationForm.get(key);
      if (control)
      {
        control.markAsTouched();
      }
    });
  }

  selectPaymentMethod(paymentMethod: string): void
  {
    this.selectedPaymentMethod = paymentMethod;
    this.registrationForm.patchValue({ paymentMethod });

    setTimeout(() =>
    {
      document.querySelectorAll('.payment-option').forEach(option =>
      {
        option.classList.remove('selected');
      });

      const selectedOption = document.querySelector(`[data-payment="${paymentMethod}"]`);
      if (selectedOption)
      {
        selectedOption.classList.add('selected');
      }
    });

    this.showMercadopagoOptions = paymentMethod === 'mercadopago';

    if (paymentMethod !== 'mercadopago')
    {
      this.registrationForm.patchValue({ mercadopagoType: '' });
    }
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldErrorMessage(fieldName: string): string
  {
    const field = this.registrationForm.get(fieldName);
    if (!field || !field.errors || !field.touched)
    {
      return '';
    }

    const errors = field.errors;

    if (errors['required'])
    {
      return 'Este campo es obligatorio';
    }

    if (errors['email'])
    {
      return 'Ingresa un correo electrónico válido';
    }

    if (errors['minlength'])
    {
      const requiredLength = errors['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    }

    if (errors['ageInvalid'])
    {
      return 'Debes ser mayor de 18 años';
    }

    if (errors['documentInvalid'])
    {
      return 'Ingresa un documento válido (7-8 dígitos)';
    }

    if (errors['requiredTrue'])
    {
      return 'Debes aceptar los términos y condiciones';
    }

    return 'Campo inválido';
  }

  get progressPercentage(): number
  {
    return (this.currentStep / this.totalSteps) * 100;
  }

  get isFirstStep(): boolean
  {
    return this.currentStep === 1;
  }

  get isLastStep(): boolean
  {
    return this.currentStep === this.totalSteps;
  }

  get nextButtonText(): string
  {
    return this.isLastStep ? 'Finalizar Registro' : 'Siguiente';
  }

  get nextButtonIcon(): string
  {
    return this.isLastStep ? 'fas fa-check' : 'fas fa-arrow-right';
  }

  async submitForm(): Promise<void>
  {
    if (!this.validateCurrentStep())
    {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try
    {
      const registerData = this.mapFormDataToBackend();

      this.authService.register(registerData).subscribe({
        next: (response) =>
        {
          this.registrationComplete = true;
          this.updateProgress();

          setTimeout(() =>
          {
            this.router.navigate(['/socio']);
          }, 3000);
        },
        error: (error) =>
        {
          console.error('Error en el registro:', error);

          if (error.status === 409)
          {
            this.errorMessage = 'El email o DNI ya está registrado';
          } else if (error.status === 400)
          {
            this.errorMessage = 'Datos inválidos. Por favor verifica la información';
          } else
          {
            this.errorMessage = 'Hubo un error al procesar tu registro. Por favor intenta nuevamente.';
          }

          alert(this.errorMessage);
          this.isSubmitting = false;
        },
        complete: () =>
        {
          this.isSubmitting = false;
        }
      });

    } catch (error)
    {
      console.error('Error inesperado:', error);
      alert('Hubo un error inesperado. Por favor intenta nuevamente.');
      this.isSubmitting = false;
    }
  }

  private mapFormDataToBackend(): RegisterRequest
  {
    const formValue = this.registrationForm.value;
    const numeroSocio = this.generateNumeroSocio();
    const direccionCompleta = `${formValue.address}, ${formValue.city}, ${formValue.province}`;

    return {
      numero_socio: numeroSocio,
      dni: formValue.document,
      nombre: formValue.firstName,
      apellido: formValue.lastName,
      telefono: formValue.phone || '',
      email: formValue.email,
      password: formValue.password,
      direccion: direccionCompleta,
      metodo_pago: this.selectedPaymentMethod
    };
  }

  private generateNumeroSocio(): string
  {
    const timestamp = Date.now();
    return `SOC${timestamp.toString().slice(-8)}`;
  }

  resetForm(): void
  {
    this.registrationForm.reset();
    this.currentStep = 1;
    this.selectedPaymentMethod = '';
    this.showMercadopagoOptions = false;
    this.registrationComplete = false;
    this.isSubmitting = false;
    this.errorMessage = '';
    this.updateStep();
  }

  goHome(): void
  {
    this.router.navigate(['/']);
  }
}
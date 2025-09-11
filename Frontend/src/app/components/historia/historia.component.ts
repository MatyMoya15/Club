import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.component.html',
  styleUrls: ['./historia.component.css']
})
export class HistoriaComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initParallaxEffect();
    this.initImageEffects();
  }

  private initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
      observer.observe(el);
    });
  }

  private initParallaxEffect(): void {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.history-hero') as HTMLElement;
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    });
  }

  private initImageEffects(): void {
    document.querySelectorAll('.gallery-image').forEach(img => {
      img.addEventListener('click', function() {
        // Aquí puedes agregar funcionalidad adicional si lo deseas
      });
    });
  }
}
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SociosInfoComponent } from './socios-info.component';

describe('SociosInfoComponent', () => {
  let component: SociosInfoComponent;
  let fixture: ComponentFixture<SociosInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SociosInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SociosInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

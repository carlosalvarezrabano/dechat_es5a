import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPopupComponent } from './login-popup.component';

describe('LoginPopupComponent', () => {
  let component: LoginPopupComponent;
  let fixture: ComponentFixture<LoginPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be there an element with loading text', () => {
    const fixture = TestBed.createComponent(LoginPopupComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#app-container').textContent).toContain('Loading...');
  });
});

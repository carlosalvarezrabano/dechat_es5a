import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPaneComponent } from './main-pane.component';

describe('MainPaneComponent', () => {
  let component: MainPaneComponent;
  let fixture: ComponentFixture<MainPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be there a button element for sending messages', () => {
    const fixture = TestBed.createComponent(MainPaneComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('button').textContent).toContain('Send');
  });
  
});

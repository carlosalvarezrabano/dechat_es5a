import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { DebugElement } from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have as h1 tag: Profile', async(() => {
        const fixture = TestBed.createComponent(CardComponent);
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('h1').textContent).toContain('Profile');
    }))

});


describe('Form testing', () => {
    let comp: CardComponent;
    let fixture: ComponentFixture<CardComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CardComponent],
            imports: [BrowserModule,
                FormsModule,
                ReactiveFormsModule]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(CardComponent);
            comp = fixture.componentInstance;
            de = fixture.debugElement.query(By.css('form'));
            el = de.nativeElement;
        });
    }));

    it('should call the submit method', async(() => {
        fixture.detectChanges();
        spyOn(comp,'onSubmit');
        el = fixture.debugElement.query(By.css('button')).nativeElement;
        el.click();
        expect(comp.onSubmit).toHaveBeenCalledTimes(0);

    }))
})

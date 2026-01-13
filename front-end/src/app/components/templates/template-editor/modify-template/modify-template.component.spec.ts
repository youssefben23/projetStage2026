import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyTemplateComponent } from './modify-template.component';

describe('ModifyTemplateComponent', () => {
  let component: ModifyTemplateComponent;
  let fixture: ComponentFixture<ModifyTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

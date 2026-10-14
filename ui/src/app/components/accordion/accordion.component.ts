import { I18nPipe } from "../../i18n/i18n.pipe";
import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  standalone: true,
  imports: [NgClass, NgIconComponent, NgIf, I18nPipe],
})
export class AccordionComponent {
  @Input() title: string = '';
  @Input() iconImage: string = '';
  @Input() isOpen: boolean = false;
  @Input() dynamicClass: string = '';
  @Input() isConnected: boolean = false;
  @Input() withConnectionStatus: boolean = false;
  @Input() showBetaTag: boolean = false;

  @Output() toggleAccordion = new EventEmitter<void>();

  onToggleAccordion() {
    this.toggleAccordion.emit();
  }
}

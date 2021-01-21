import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'credit-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input('card') card: any = {
    color: 'dark'
  }
  @Input('showDelete') showDeleteBtn: Boolean = false
  @Output() delete: EventEmitter<any> = new EventEmitter()

  constructor() {
  }

  ngOnInit() {
    console.log('card', this.card);
    this.card.color = this.card.color ? this.card.color : 'dark'
    if (this.card.number.length > 4) this.card.number = this.card.number.substr(this.card.number.length - 4)
  }

  removeCard(card) {
    this.delete.emit(card)
  }

}

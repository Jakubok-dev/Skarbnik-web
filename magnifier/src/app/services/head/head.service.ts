import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HeadService {

  constructor(private titleService :Title, private metaService :Meta) { 
    titleService.setTitle(this.title);
    metaService.addTag({ name: `description`, content: this.description });
  }

  private titleBase = "Skarbnik";
  private _titlePrefix = "";

  set titlePrefix(value :string) {
    this._titlePrefix = value;
    this.titleService.setTitle(this.title);
  }

  get title() {
    if (this._titlePrefix)
      return `${this.titleBase} - ${this._titlePrefix}`;
    return this.titleBase;
  }

  private descriptionBase = "Program do zarządania grupowymi oszczędnościami";
  private _descriptionPrefix = "";

  set descriptionPrefix(value :string) {
    this._descriptionPrefix = value;
    this.metaService.updateTag({ name: `description`, content: this.description });
  }

  get description() {
    if (this._descriptionPrefix)
      return `${this.descriptionBase} ${this._descriptionPrefix}`;
    return this.descriptionBase;
  }
}

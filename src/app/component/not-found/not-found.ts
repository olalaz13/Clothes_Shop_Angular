import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './not-found.html',
    styleUrl: './not-found.css'
})
export class NotFound {
    constructor(private location: Location) { }

    goBack(): void {
        this.location.back();
    }
}

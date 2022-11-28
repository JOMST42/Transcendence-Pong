import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services';
import { UserService } from '../../../user/services';
import { User } from '../../../user/models';
import { Subject, takeUntil } from 'rxjs';
import { PlayService } from 'src/app/play/play.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private unsubscribeAll$ = new Subject<void>();
  @Input() user!: User | null;
  avatarUrl: string;
  userIsMe: boolean;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  handleClick() {
    window.location.href = 'http://localhost:3000/api/auth/ft/login';
    this.authService.login();
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        this.user = user;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  refreshUser(): void {
    this.authService
      .refreshProfile()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}

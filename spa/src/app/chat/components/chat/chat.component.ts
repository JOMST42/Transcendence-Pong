import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, take, takeUntil, tap } from 'rxjs';

import { ToastService } from '../../../core/services';
import { Room } from '../../models';
import { ChatService } from '../../services';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private unsubscribeAll$ = new Subject<void>();
  private newUser$: Subscription = null;
  rooms: Room[];
  selectedChannel: Room | null = null;

  constructor(
    private readonly chatService: ChatService,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService
  ) {}

  ngOnDestroy(): void {
    this.leaveChannel();
    this.unsubscribeAll$.next();
  }

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.unsubscribeAll$)).subscribe((data) => {
      this.rooms = data['rooms'];
    });
  }

  createRoom(): void {
    this.chatService
      .createRoom({ name: 'test' })
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((newRoom) => {
        this.rooms.push(newRoom);
        this.toastService.showSuccess(
          'Success',
          `Created chat room ${newRoom.name}`
        );
      });
  }

  onChannelSelect(channel: Room): void {
    this.chatService
      .getChatRoom(channel.id)
      .pipe(
        take(1),
        tap((data) => {
          this.leaveChannel();
          this.chatService.joinRoom(data.id);
          if (this.newUser$) {
            this.newUser$.unsubscribe();
          }
          this.newUser$ = this.chatService.getNewUser().subscribe({
            next: (user) => {
              this.selectedChannel.users.push(user);
            },
          });
        })
      )
      .subscribe({
        next: (data) => {
          data.messages.reverse();
          this.selectedChannel = data;
        },
      });
  }

  leaveChannel(): void {
    if (this.selectedChannel) {
      this.chatService.leaveRoom(this.selectedChannel.id);
    }
  }
}

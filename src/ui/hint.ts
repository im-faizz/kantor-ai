export class CameraHint {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'camera-hint';
    this.element.textContent =
      'Seret untuk geser kamera · scroll atau cubit untuk zoom · ketuk karakter untuk chat';
  }
}

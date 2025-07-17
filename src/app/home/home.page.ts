import { AfterViewInit, Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements AfterViewInit{
  userMarker: L.Marker | undefined;

  constructor() {}

  map: any;

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
    this.watchPosition();
  }

  initMap(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
    });

    this.map = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  async watchPosition(): Promise<void> {
    const permission = await Geolocation.requestPermissions();

    if (permission.location === 'granted') {
      Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
        if (err) {
          console.error('Błąd lokalizacji:', err);
          return;
        }

        if (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.map.setView([lat, lng], 15);

          if (this.userMarker) {
            this.userMarker.setLatLng([lat, lng]);
          } else {
            this.userMarker = L.marker([lat, lng])
              .addTo(this.map)
              .bindPopup('Jesteś tutaj!')
              .openPopup();
          }
        }
      });
    } else {
      console.warn('Lokalizacja niedozwolona.');
    }
  }
}

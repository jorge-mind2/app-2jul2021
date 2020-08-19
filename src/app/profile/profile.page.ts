import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any = {}
  userType: string = ''
  loading: any
  photoProfile: string

  imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50
  };
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private camera: Camera,
    private file: File,
    private crop: Crop,
    private auth: AuthService,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.getUserInfo()
  }

  private getUserInfo() {
    this.auth.getCurrentUser().then(async (user: any) => {
      this.photoProfile = await this.api.getPhotoProfile(user)
      if (!user.detail && user.role.name == 'therapist') {
        const info = await this.api.getTherapistProfile(user.id)
        this.api.setTherapistDetail(info.data.detail)
        user.detail = info.data.detail
      }
      this.user = user
      this.userType = user.role.name
    })
  }

  pickImage(sourceType) {
    const options: CameraOptions = {
      quality: 100,
      sourceType,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.cropImage(imageData)
    }, (error) => {
      // Handle error
      if (error != 'No Image Selected') this.presentErrorAlert('No se pudo obtener la imagen. Inténtalo de nuevo.')
      console.log(error);
    });
  }

  async selectImage() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Selecciona tu foto de perfil",
      buttons: [{
        text: 'De Galeria',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Abrir Camera',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  cropImage(fileUrl) {
    this.crop.crop(fileUrl, { quality: 100 })
      .then(
        newPath => {
          this.uploadCroppedImage(newPath.split('?')[0])
        },
        error => {
          // alert('Error cropping image' + error);
          console.log(error);
          if (error.code != 'userCancelled') this.presentErrorAlert('Error al recortar imagen: ' + error.message);
        }
      );
  }

  async uploadCroppedImage(ImagePath) {
    await this.presentLoading('Cargando...')
    try {
      var copyPath = ImagePath;
      var splitPath = copyPath.split('/');
      var imageName = splitPath[splitPath.length - 1];
      var filePath = ImagePath.split(imageName)[0];

      this.file.readAsDataURL(filePath, imageName).then(async base64 => {
        console.log(base64.length);
        const base64Image = base64.split(';base64,').pop()
        // console.log('base64Image', base64Image.length);
        const photoData = await this.api.uploadUserPhoto(this.user.id, { photo: base64Image });
        console.log('photoData', photoData);
        const photoName = `${this.user.cometChatId}_${this.user.uuid.split('-')[0]}`;

        await this.auth.setCurrenUserPhoto(photoName)
        await this.loading.dismiss()
        this.photoProfile = base64
        this.presentToast('Foto de perfil actualizada.')
      }, async error => { throw error });
    } catch (error) {
      console.log(error);
      this.presentErrorAlert('Error al preparar imagen: ' + error);
      await this.loading.dismiss()
    }
  }


  async logout() {
    await this.auth.logout()
    this.navCtrl.navigateRoot('welcome')
  }

  public async presentLogoutAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión de Mind2?',
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'text-secondary',
        handler: () => this.logout()
      }, {
        text: 'Cancelar',
        cssClass: 'primary'
      }]
    })

    alert.present();
  }


  async presentLoading(message: string) {
    this.loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message
    })
    await this.loading.present();
  }

  async presentErrorAlert(message) {
    const alert = await this.alertCtrl.create({
      header: 'Algo salió mal',
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }


  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}

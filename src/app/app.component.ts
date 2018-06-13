import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  public gameObjects = [
    {
      id: '72850',
      name: 'Skyrim',
      age: 12
    },
    {
      id: '22300',
      name: 'Fallout 3',
      age: 2
    },
    {
      id: '5454082e',
      name: 'Red dead redemption',
      age: 3
    },
    {
      id: '72850',
      name: 'Pacman',
      age: 4
    },
    {
      id: '22300',
      name: 'Gianna sisters',
      age: 5
    },
    {
      id: '5454082b',
      name: 'Dyna blaster',
      age: 6
    },
    {
      id: '5454082c',
      name: 'Css',
      age: 7
    },
    {
      id: '5454082d',
      name: 'BC Racers',
      age: 8
    }
  ];

  public availableGames = [
    this.gameObjects[0],
    this.gameObjects[1],
    this.gameObjects[2]
  ];
  public availableGamesAsync = [];
  public availableGamesAsyncTimeout;
  public game = this.gameObjects[0].id;
  public gameObject = this.gameObjects[0];
  public gameObjectAdd = {id: null, name: null};
  public games = ['72850', '5454082b'];
  public gamesObject = [this.gameObjects[1]];
  public gamesAdd = ['sdfljk'];
  public gamesObjectAdd = [{id: 'asd', name: 'asd'}];
  public gamesAsync = [{name: null, id: null}];
  public isOptionsLoading: boolean;

  findGames(search) {
    if (typeof this.availableGamesAsyncTimeout !== 'undefined') {
      clearTimeout(this.availableGamesAsyncTimeout);
    }

    this.isOptionsLoading = true;
    this.availableGamesAsyncTimeout = setTimeout(() => {
      this.availableGamesAsync = [
        this.gameObjects[3],
        this.gameObjects[4],
        this.gameObjects[5],
        this.gameObjects[6],
        this.gameObjects[7]
      ];

      this.isOptionsLoading = false;
    }, 700);
  }
}

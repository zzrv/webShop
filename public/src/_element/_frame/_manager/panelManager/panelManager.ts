import Manager from "./../manager";
import Panel from "./../../_panel/panel"
import lazyLoad, {ImportanceMap, Import} from "./../../../../lib/lazyLoad/lazyLoad";

export default class PanelManager extends Manager {
  protected currentFrame: Panel;
  private _currentPanelName: string;

  private map: Map<string, Promise<any>>;
  constructor(panel: string, setPanelCb: Function, public blurCallback?: Function) {
    super();

    let cb = (e) => {if (this.blurCallback !== undefined) this.blurCallback(e)};

    const impMap = new ImportanceMap<() => Promise<any>>(
      {key: new Import<string>("newArticle", 3, (AddArticlePanel) => {
        return new AddArticlePanel(cb, async () => {
          (await this.map.get("shop")).fetch();
        });
      }), val: () => import("./../../_panel/_windowPanel/newArticlePanel/newArticlePanel")},
      {key: new Import<string>("shop", 1, (Shop) => {
        return new Shop(cb, true, async () => {
          (await this.map.get("cart")).fetch();
        });
      }), val: () => import("./../../_panel/shopPanel/shopPanel")},
      {key: new Import<string>("cart", 2, (Cart) => {
        return new Cart(() => {
          setPanelCb("shop");
        }, cb, false);
      }), val: () => import("./../../_panel/cartPanel/cartPanel")},
    );

    this.map = lazyLoad(impMap)((panel) => {
      this.body.apd(panel);
    });

    this.setPanel(panel);
  }
  public async setPanel(to: string) {
    this._currentPanelName = to;
    this.swapFrame(await this.map.get(to));
  }
  public getPanel(): string {
    return this._currentPanelName;
  }
  protected async activationCallback(active: boolean) {
    (await this.map.get("cart")).fetch();
    this.currentFrame.vate(active)
  }
  stl() {
    return super.stl() + require('./panelManager.css').toString();
  }

}

window.customElements.define('c-panel-manager', PanelManager);

import "./scss/Multiselect.scss";
/**
 * @description dependency
 */
import tippy from "tippy.js";
import debounce from "lodash-es/debounce";
import { Instance as InstanceTippy } from "tippy.js/index";

import { defaultOptions, formGroup, OptionsType } from "./deflautOptions";
import {
  deselectAllSelect,
  selectAllSelect,
  selectValueSelect,
  eventsSelect,
  deSelectValueSelect,
  addOption
} from "./selectHelpers";

class Multiselect {
  readonly element: HTMLSelectElement;
  private parentElement: HTMLElement | null;
  readonly selectror: string;
  private options: OptionsType | null;
  readonly wrapper: HTMLElement | null;
  private tippyInstance: InstanceTippy | null;
  private processAjaxResponse: boolean = false;

  /**
   *
   * @param selectror
   * @param options
   */
  constructor(selectror: string, options: Partial<OptionsType> | null) {
    this.tippyInstance = null;
    this.options = { ...defaultOptions, ...options };
    if (!selectror) {
      throw new Error("selector is required");
    }
    this.selectror = selectror;
    this.element = document.querySelector(this.selectror) as HTMLSelectElement;
    if (this.element.getAttribute("multiple") === null) {
      throw new Error(`only multiselect support, ${this.element}`);
    }
    if (!this.element) {
      throw new Error("element is required");
    }
    this.parentElement = this.element.parentElement as HTMLElement;

    if (!this.options.debug) {
      this._hideSelect();
    }
    // selectValueSelect(1, this.element);
    // selectAllSelect(this.element);
    // deselectAllSelect(this.element);
    this._appendMainWrap(this._createTemplateWrapper());
    this.wrapper = this.parentElement.querySelector(
      ".js-multiselectWrapper"
    ) as HTMLElement;
    this._initEvents();
  }

  /**
   * @description select value in select
   * @param value
   * @param text
   */
  public AddOption(value: string | number, text: string | number) {
    addOption(this.element, value, text);
  }

  /**
   * @description select option as selected
   * @param value
   * @param text
   */
  public SelectValue(value: string | number, text?: string): void {
    selectValueSelect(value, this.element, this.wrapper);
  }

  /**
   * @description un select option
   * @param value
   */
  public deSelectValue(value: string | number): void {
    deSelectValueSelect(value, this.element, this.wrapper);
  }

  /**
   * @description select all option
   */
  public selectAllElements(): void {
    selectAllSelect(this.element, this.wrapper);
  }

  /**
   * @description deselect all option
   */
  public DeSelectAll(): void {
    deselectAllSelect(this.element, this.wrapper);
  }

  /**
   * @description return instance of tippyjs
   * @return Object
   */
  public getInstanceTippy(): InstanceTippy | null {
    return this.tippyInstance;
  }

  private _createTemplateWrapper(): string {
    let template: string = `
                            <div class="multiselectWrapper js-multiselectWrapper">
                                <button type="button" role="button"tabindex="0" class="multiselect-mainLabel js-multiselect-mainLabel">${this.options?.mainLabelName}</button>
                            </div>
                            `;
    return template;
  }

  private _appendMainWrap(template: string): void {
    this.parentElement!.insertAdjacentHTML("beforeend", template);
  }

  private _hideSelect(): void {
    this.element!.style.display = "none";
  }

  private _initEvents(): void | boolean {
    this.tippyInstance = this._initDropdown();
    if (!this.tippyInstance) {
      return false;
    }
    const popper = this.tippyInstance.popper as HTMLElement;
    this._searchOption(popper);
    if (this.element && this.wrapper) {
      eventsSelect(this.element, this.wrapper);
      this._lisentoChangesSelect();
    }
  }

  private _lisentoChangesSelect(): void {
    const that = this;
    const labelMain = this.wrapper?.querySelector(
      ".js-multiselect-mainLabel"
    ) as HTMLLabelElement;
    this.wrapper?.addEventListener("changeSelect", (e: Event) => {
      if (that.options?.debug) {
        console.log("changeSelect", e);
      }
      this.options?.mainLabelNameCallback(labelMain, this.element);
    });
  }

  private _searchOption(popper: HTMLElement): void {
    const that = this;
    const input = popper.querySelector(".js-tippy-search") as HTMLInputElement;
    const name = this.element.name as string;
    input.addEventListener(
      "keyup",
      debounce(async (e: Event) => {
        const value = (<HTMLInputElement>e.target).value;
        if (that.options?.ajax?.getData() === null) {
          that._showMatchedElements(value);
        } else {
          that._showMatchedElementsAjax(value, name);
        }
      }, 200)
    );
  }

  private _showSearchMessageAjax() {
    this._showMessage(this.options?.searching, true);
  }

  private _showNoResultMessage() {
    this._showMessage();
  }

  private _showNoResultMessageAjax() {
    this._showMessage(this.options?.searching, true);
  }

  private _showMessage(
    message: string = "Brak wyników",
    ajax: boolean = false
  ) {
    const popper = (<InstanceTippy>this.tippyInstance).popper as HTMLElement;
    const wrapForInputs = popper.querySelector(
      ".js-tippy-wrap-list"
    ) as HTMLElement;
    const messageTemplate = `<div class="multiselect-no-result js-multiselect-no-result">${message}</div>`;
    if (ajax) {
      wrapForInputs.innerHTML = messageTemplate;
    } else {
      const noResult = wrapForInputs.querySelector(
        ".js-multiselect-no-result"
      ) as HTMLElement;
      if (!noResult) {
        wrapForInputs.innerHTML += messageTemplate;
      } else {
        noResult.classList.remove("hide");
      }
    }
  }

  private _removeMessage() {
    const popper = (<InstanceTippy>this.tippyInstance).popper as HTMLElement;
    const wrapForInputs = popper.querySelector(
      ".js-tippy-wrap-list"
    ) as HTMLElement;
    const noMessageEl = wrapForInputs.querySelector(
      ".js-multiselect-no-result"
    ) as HTMLElement;
    if (noMessageEl) {
      noMessageEl.remove();
    }
  }

  private _getElemntfromUrl(
    value: string,
    name: string
  ): Promise<[formGroup]> | null {
    if (!value && !name) {
      return null;
    }
    return this.options?.ajax?.getData(value, name) ?? null;
  }

  private async _showMatchedElementsAjax(value: string, name: string) {
    const that = this;
    const popper = (<InstanceTippy>that.tippyInstance).popper as HTMLElement;
    const wrapForInputs = popper.querySelector(
      ".js-tippy-wrap-list"
    ) as HTMLElement;

    if (!value) {
      that._showSelectedElements(wrapForInputs);
      return false;
    }
    this._showSearchMessageAjax();
    const response = await that._getElemntfromUrl(value, name);
    let template: string = ``;
    if (response && response.length > 0) {
      response.forEach(element => {
        const { name, value, text } = element;
        let selected = false;
        const option = that.element.querySelector(
          `option[value="${value.toString()}"]`
        ) as HTMLOptionElement;
        if (option && option.selected) {
          selected = true;
        }
        template += that._buildFormGroupTemplates(name, value, text, selected);
      });
      wrapForInputs.innerHTML = template;
      this.processAjaxResponse = true;
    } else {
      that._showNoResultMessageAjax();
    }
  }

  private _showSelectedElements(wrapForInputs: HTMLElement): void {
    const that = this;
    const selectedOptions = that.element.querySelectorAll(
      "option:checked"
    ) as NodeListOf<HTMLOptionElement>;
    let template: string = ``;
    selectedOptions.forEach(option => {
      const formGroup: formGroup = {
        name: that.element.name,
        value: option.value,
        text: option.text
      };
      template += that.options?.formGroupRenderer(formGroup, true);
    });
    wrapForInputs.innerHTML = template;
  }

  private _showMatchedElements(value: string): void | boolean {
    if (!this.tippyInstance) {
      return false;
    }
    const popper = this.tippyInstance.popper as HTMLElement;
    const labels = popper.querySelectorAll("label") as NodeListOf<
      HTMLLabelElement
    >;
    if (value.length === 0) {
      this._removeMessage();
      labels.forEach(label => {
        (<HTMLElement>label.parentNode).classList.remove("hide");
      });
    }
    labels.forEach(label => {
      if (!label.innerHTML.toLowerCase().includes(value.toLowerCase())) {
        (<HTMLElement>label.parentNode).classList.add("hide");
      } else {
        (<HTMLElement>label.parentNode).classList.remove("hide");
      }
    });
    const visibleLabels = popper.querySelectorAll(
      ".js-tippy-wrap-list .form-group:not(.hide)"
    );
    if (visibleLabels.length === 0) {
      this._showNoResultMessage();
    }
  }

  private _lisenChangesInputDropdown(wrap: HTMLElement): void {
    const wrapInputs = wrap.querySelector(".js-tippy-wrap-list") as HTMLElement;
    wrapInputs.addEventListener("change", (e: Event) => {
      const el = e.target as HTMLInputElement;
      const checked = el.checked;
      if (this.options?.ajax && this.processAjaxResponse) {
        const text =
          (<HTMLElement>el.parentNode).querySelector("label")?.innerHTML ??
          "no value";
        /**
         * @description for input add by ajax
         */
        if (checked) {
          addOption(this.element, el.value, text);
          selectValueSelect(el.value, this.element, this.wrapper);
        } else {
          deSelectValueSelect(el.value, this.element, this.wrapper);
        }
        this.processAjaxResponse = false;
      } else if (checked) {
        selectValueSelect(el.value, this.element, this.wrapper);
      } else {
        deSelectValueSelect(el.value, this.element, this.wrapper);
      }
      const labelMain = this.wrapper?.querySelector(
        ".js-multiselect-mainLabel"
      ) as HTMLLabelElement;
      this.options?.mainLabelNameCallback(labelMain, this.element);
    });
  }

  private assignEscapeKey(e: KeyboardEvent, instance: InstanceTippy) {
    if (e.code === "Escape") {
      const reference = instance.reference as HTMLElement;
      reference.querySelector("button")?.focus();
      instance.hide();
    }
  }

  private _initDropdown(): InstanceTippy | null {
    const that = this;
    let tippyInstance = null;
    if (this.wrapper) {
      tippyInstance = tippy(this.wrapper, {
        role: "dropdown",
        theme: that.options?.tippy?.theme,
        trigger: "click",
        arrow: false,
        interactive: true,
        allowHTML: true,
        appendTo: "parent",
        placement: "bottom-start",
        content: that.options?.tippy?.content,
        onHide(instance) {
          document.body.removeEventListener("keyup", e =>
            that.assignEscapeKey(e, instance)
          );
        },
        onShow(instance) {
          document.body.addEventListener("keyup", e =>
            that.assignEscapeKey(e, instance)
          );
          const popper = instance.popper as HTMLElement;
          const wrapForInputs = popper.querySelector(
            ".js-tippy-wrap-list"
          ) as HTMLElement;
          const options = that.element.querySelectorAll("option") as NodeListOf<
            HTMLOptionElement
          >;
          const name = that.element.name;
          const tippyBox = popper.querySelector(".tippy-box") as HTMLElement;
          tippyBox.tabIndex = 1;
          that._clearFormGroupTemplates(instance);
          that._removeMessage();
          options.forEach(option => {
            if (!option.innerHTML) {
              return;
            }
            wrapForInputs.innerHTML += that._buildFormGroupTemplates(
              name,
              option.value,
              option.innerHTML,
              option.selected
            );
          });

          const searchInput = popper.querySelector(
            ".js-tippy-search"
          ) as HTMLInputElement;
          searchInput.value = "";
          setTimeout(() => {
            searchInput.focus();
          }, 100);
          // selectWrap.classList.add("show");
        },
        onMount(instance) {
          console.log(instance);
          const wrap = instance.popper as HTMLElement;
          const reference = instance.reference as HTMLElement;
          const { width } = instance.reference.getBoundingClientRect();

          wrap.classList.add("multiselect_tippy");
          reference.style.width = width + "px";
          const tippyBox = instance.popper.querySelector(
            ".tippy-box"
          ) as HTMLElement;
          tippyBox.style.width = width + "px";
          /**
           * @description set max width to parent
           */
          instance.setProps({
            maxWidth: width
          });

          that._lisenChangesInputDropdown(wrap);
        }
      }) as InstanceTippy;
    }
    return tippyInstance;
  }

  private _clearFormGroupTemplates(instance: any): void {
    const popper = instance.popper as HTMLElement;
    const formGroups = popper.querySelectorAll(
      ".js-tippy-wrap-list .js-form-group"
    ) as NodeListOf<HTMLElement>;
    formGroups.forEach(form => {
      form.remove();
    });
  }

  private _buildFormGroupTemplates(
    name: string,
    value: string,
    text: string,
    selected: boolean = false
  ): string {
    const formGroup: formGroup = {
      name: name,
      value: value.toString(),
      text: text.toString()
    };
    return this.options?.formGroupRenderer(formGroup, selected) ?? ``;
  }
}

const multiselect2 = new Multiselect(".js-multiselect2", {
  debug: true
});

// const multiselect = new Multiselect(".js-multiselect", {
//   debug: true,
//   ajax: {
//     getData(value: string, name: string): Promise<any> | null {
//       return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           const tmpObject: Array<formGroup> = [
//             {
//               name: name,
//               value: value,
//               text: value
//             }
//           ];
//           resolve(tmpObject);
//         }, 1000);
//       });
//     }
//   }
// });

// multiselect.AddOption(123, "treść");
// multiselect.SelectValue(123);
// setTimeout(() => {
//   multiselect.selectAllElements();
// }, 500);
// console.log(multiselect.getInstanceTippy());

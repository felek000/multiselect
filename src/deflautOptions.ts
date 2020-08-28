export interface OptionsType {
  debug: boolean;
  mainLabelName: string;
  searchPlaceholder: string;
  searching: string;
  noResult: string;
  formGroupRenderer(formGroup: formGroup, selected: boolean): string;
  mainLabelNameCallback(label?: HTMLElement, hiddenSelect?: HTMLElement): any;
  ajax: {
    getData(name?: string, value?: string): Promise<[formGroup]> | null;
  } | null;
  tippy: {
    theme?: string;
    content(reference: Object): any;
  };
}
export interface formGroup {
  name: string;
  value: string;
  text: string;
}
export const defaultOptions: OptionsType = {
  debug: false,
  mainLabelName: "Etykieta",
  searchPlaceholder: "Wyszukaj...",
  searching: "Wyszukiwanie...",
  noResult: "Brak wyników",
  mainLabelNameCallback: (
    label: HTMLElement,
    hiddenSelect: HTMLSelectElement
  ): void => {
    if (!label || !hiddenSelect) {
      throw new Error("no params provaided");
    }
    let template = defaultOptions?.mainLabelName ?? ``;
    const options = hiddenSelect.querySelectorAll(
      "option:checked"
    ) as NodeListOf<HTMLOptionElement>;
    let counter = 0;
    options.forEach(option => {
      if (option.value) {
        counter++;
      }
    });
    if (counter > 0) {
      template = `Zaznaczono ${counter}`;
    }
    label.innerHTML = template;
  },
  formGroupRenderer: function(
    formGroup: formGroup,
    selected: boolean = false
  ): string {
    if (!formGroup) {
      throw new Error("to few arguments");
    }
    const { name, value, text } = formGroup;
    let template = ``;
    template = `<div class="form-group js-form-group">
                    <label for="name-${value}">${text}</label>
                    <input
                            ${selected ? "checked" : ""}
                            type="checkbox"
                            name="${name}"
                            id="name-${value}"
                            value="${value}"
                    >
                </div>`;
    return template;
  },
  ajax: {
    getData: (): null => {
      return null;
    }
  },
  tippy: {
    theme: "light",
    content: function(reference: Object) {
      let template = `<div class="tippy-wrap-select">`;
      template += `   <div class="">
                            <div
                                class="
                                        form-group form-group--search
                                        "
                              >
                              <input type="text" placeholder="${defaultOptions.searchPlaceholder}" class="form-control form-control--search js-tippy-search form-control--visiblePlaceholder">
                            </div>
                         </div>`;
      template += `<div class="js-tippy-wrap-list tippy-wrap-list">`;
      template += `<div class="js-multiselect-no-result tippy-no-results hide">${defaultOptions.noResult}</div>`;
      template += `</div>`;
      template += `</div>`;
      return template;
    }
  }
};

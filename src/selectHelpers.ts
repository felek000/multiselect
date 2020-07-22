/**
 * @description select option
 * @param valueOption
 * @param element
 * @private
 */
export function selectValueSelect(
  valueOption: string | number,
  element: HTMLSelectElement,
  wrapper: HTMLElement | null = null
): void {
  const option = element!.querySelector(
    'option[value="' + valueOption + '"]'
  ) as HTMLOptionElement;
  if (option) {
    option.selected = true;
    if (wrapper) {
      _createAndTriggerEvent(wrapper, null);
    }
  } else {
    throw new Error("element not exist");
  }
}

/**
 * @description deselect option
 * @param valueOption
 * @param element
 * @param wrapper
 * @private
 */
export function deSelectValueSelect(
  valueOption: string | number,
  element: HTMLSelectElement,
  wrapper: HTMLElement | null = null
): void {
  const option = element!.querySelector(
    'option[value="' + valueOption + '"]'
  ) as HTMLOptionElement;
  if (option) {
    option.selected = false;
    if (wrapper) {
      _createAndTriggerEvent(wrapper, null);
    }
  } else {
    throw new Error("element not exist");
  }
}

/**
 *
 * @param element
 */
export function selectAllSelect(
  element: HTMLSelectElement,
  wrapper?: HTMLElement | null
): void {
  const options = element.querySelectorAll("option");
  options.forEach(option => {
    if (option.value) {
      option.selected = true;
    }
  });
  if (wrapper) {
    _createAndTriggerEvent(wrapper, null);
  }
}

/**
 *
 * @param element
 */
export function deselectAllSelect(
  element: HTMLSelectElement,
  wrapper?: HTMLElement | null
): void {
  const options = element.querySelectorAll("option");
  options.forEach(option => {
    option.selected = false;
  });
  if (wrapper) {
    _createAndTriggerEvent(wrapper, null);
  }
}

/**
 *
 * @param element
 * @param targetListner
 */
export function eventsSelect(
  element: HTMLSelectElement,
  targetListner: HTMLElement
) {
  if (!element || !targetListner) {
    throw Error("to few arguments");
  }
  _onChangeSelect(element, targetListner);
}

/**
 *
 * @param element
 * @param targetListner
 * @private
 */
export function _onChangeSelect(
  element: HTMLSelectElement,
  targetListner: HTMLElement
) {
  if (!element || !targetListner) {
    throw Error("to few arguments");
  }
  element?.addEventListener("change", e => {
    _createAndTriggerEvent(targetListner, e);
  });
}

/**
 *
 * @param targetListner
 * @param e
 * @private
 */
function _createAndTriggerEvent(targetListner: HTMLElement, e: Event | null) {
  const event = new CustomEvent("changeSelect", { detail: e ?? null });
  if (targetListner) {
    targetListner.dispatchEvent(event);
  }
}

/**
 *
 * @param select
 * @param value
 * @param text
 * @private
 */
export function addOption(
  select: HTMLSelectElement,
  value: string | number,
  text: string | number | null
) {
  const option = document.createElement("option") as HTMLOptionElement;
  option.value += value;
  option.text += text;
  select.appendChild(option);
}

export function _removeOption(option: HTMLOptionElement) {
  option.remove();
}

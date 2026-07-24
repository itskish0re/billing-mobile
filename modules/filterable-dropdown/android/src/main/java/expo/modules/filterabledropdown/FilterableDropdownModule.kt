package expo.modules.filterabledropdown

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class FilterableDropdownModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("FilterableDropdown")

    ExpoUIView<FilterableDropdownProps>("FilterableDropdownView") {
      // Never use `onSelect` — Android BaseViewConfig already has bubbling topSelect,
      // and Expo registers Events as direct → "cannot be both direct and bubbling".
      val onItemPressed by Event<FilterableDropdownItemPressedEvent>()
      val onCreatePressed by Event<FilterableDropdownCreatePressedEvent>()
      val onCleared by Event<Unit>()

      Content { props ->
        FilterableDropdownContent(
          props = props,
          onItemPressed = { onItemPressed(it) },
          onCreatePressed = { onCreatePressed(it) },
          onCleared = { onCleared(Unit) }
        )
      }
    }
  }
}

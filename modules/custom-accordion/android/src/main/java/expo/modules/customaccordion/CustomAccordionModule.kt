package expo.modules.customaccordion

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class CustomAccordionModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CustomAccordion")

    ExpoUIView<CustomAccordionProps>("CustomAccordionView") {
      val onExpandedChange by Event<ExpandedChangeEvent>()

      Content { props ->
        CustomAccordionContent(
          props = props,
          onExpandedChange = { onExpandedChange(it) }
        )
      }
    }
  }
}

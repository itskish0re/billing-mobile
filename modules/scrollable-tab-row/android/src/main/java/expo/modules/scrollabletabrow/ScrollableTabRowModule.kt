package expo.modules.scrollabletabrow

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class ScrollableTabRowModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ScrollableTabRow")

    ExpoUIView<ScrollableTabRowProps>("ScrollableTabRowView") {
      val animateScrollToIndex by AsyncFunction<Int>()
      val onTabSelected by Event<TabSelectedEvent>()

      Content { props ->
        ScrollableTabRowContent(
          props = props,
          animateScrollToIndex = animateScrollToIndex,
          onTabSelected = { onTabSelected(it) }
        )
      }
    }
  }
}

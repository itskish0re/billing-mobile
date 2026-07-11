package expo.modules.progresssnackbar

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class ProgressSnackbarModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ProgressSnackbar")

    ExpoUIView<ProgressSnackbarProps>("ProgressSnackbarView") {
      val onFinished by Event<SnackbarFinishedEvent>()

      Content { props ->
        ProgressSnackbarContent(
          props = props,
          onFinished = { onFinished(it) }
        )
      }
    }
  }
}

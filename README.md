# gnome-shell-extension kubeconfig
Gnome shell extension for switching Kubernetes cli: `kubectl` config context.

## Manual Installation

See [this guide](https://itsfoss.com/gnome-shell-extensions/) for inspiration.
Tested working on Ubuntu 18.04.3 LTS with Gnome 2.28.2

```bash
# just copy and paste this into your terminal line by line
# essentially just clone into your extension directory and then
# modify manifest.js to match the original fork's uuid of the extension

cd ~/.local/share/gnome-shell/extensions
git clone git@github.com:anthonyrichir/gnome-shell-extension-kubeconfig.git
mv gnome-shell-extension-kubeconfig kube_config@vvbogdanov87.gmail.com
```

Now restart GNOME Shell. Press `Alt+F2` and enter `r` to restart GNOME Shell, for [debugging](https://stackoverflow.com/questions/8425616/how-to-test-debug-gnome-shell-extensions-is-there-any-tool-for-that) Press `Alt+F2` and enter `lg`
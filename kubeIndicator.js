const Lang = imports.lang;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const KubePopupMenuItem = Me.imports.kubePopupMenuItem;
const Convenience = Me.imports.lib.convenience;
const yaml = Me.imports.lib.yaml;

const KubeIndicator = new Lang.Class({
    Name: "Kube",
    Extends: PanelMenu.Button,

    _init: function(metadata, params) {
        this.parent(null, "Kube");
        this._settings = Convenience.getSettings();
        this.kcPath = GLib.get_home_dir() + "/.kube/config";

        this.setMenu(new PopupMenu.PopupMenu(this.actor, 0.25, St.Side.TOP));
        
        this._setView()

        let kcFile = Gio.File.new_for_path(this.kcPath);
        this._monitor = kcFile.monitor(Gio.FileMonitorFlags.NONE, null);
        this._monitor.connect('changed', Lang.bind(this, this._update));

        this._bindSettingsChanges();
    },

    _onChange: function(m, f, of, eventType) {
        if (eventType == Gio.FileMonitorEvent.CHANGED){
            this._update()
        }
    },

    _update: function() {
        this.menu.removeAll()
        try {
            let contents = String(GLib.file_get_contents(this.kcPath)[1]);
            var kubeConfigObject = jsyaml.load( contents );

            var names = [];
            for (var i=0; i < kubeConfigObject.contexts.length; i++) {
                global.log('Element name: ' + kubeConfigObject.contexts[i].name);
                names.push(kubeConfigObject.contexts[i].name);
            };
            global.log('Names.length: ' + names.length);
            global.log('Current context: ' + kubeConfigObject['current-context']);

            const currentContext = kubeConfigObject['current-context'];
            if (currentContext && this._settings.get_boolean('show-current-context') == true ){
                this.label.text = currentContext;
            }
            
            for (var i=0; i < names.length; i++) {
                let curr = false;
                if (names[i]==currentContext){
                    curr = true;
                }
                global.log('Menu item: ' + names[i]);
                this.menu.addMenuItem(new KubePopupMenuItem.KubePopupMenuItem(names[i],curr));
            };

            // add seperator to popup menu
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            
            // add link to settings dialog
            this._menu_settings = new PopupMenu.PopupMenuItem(_("Settings"));
            this._menu_settings.connect("activate", function(){
                // call gnome settings tool for this extension
                let app = Shell.AppSystem.get_default().lookup_app("gnome-shell-extension-prefs.desktop");
                if( app!=null ) {
                    let info = app.get_app_info();
                    let timestamp = global.display.get_current_time_roundtrip();
                    info.launch_uris([Me.uuid], global.create_app_launch_context(timestamp, -1));
                }
            });
            this.menu.addMenuItem(this._menu_settings);
        } catch (e) {
            log('gnome-shell-extension-kubeconfig',e);
        }
    },

    _setView: function() {
        this.actor.remove_all_children();
        log('gnome-shell-extension-kubeconfig',"_setView");
        if ( this._settings.get_boolean('show-current-context') == false ){
            this.icon = new St.Icon({
                icon_name: 'logo',
                style_class: 'system-status-icon'
            });
            this.actor.add_actor(this.icon);
        } else {
            this.label = new St.Label({ text: _("kubectl"),
                y_align: Clutter.ActorAlign.CENTER });
            this.actor.add_actor(this.label);
        }
        this._update();
    },

    _bindSettingsChanges: function() {
        this._settings.connect('changed::show-current-context',Lang.bind(this, function() {
            this._setView();
        }));
    }
});
import gi, json, os, sys, time
gi.require_version('Gtk', '3.0'); gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib
try:
    import cairo
except Exception: cairo = None

class WK:
    def __init__(self, w=1280, h=860):
        if os.environ.get('WKDARK'): Gtk.Settings.get_default().set_property('gtk-application-prefer-dark-theme', True)
        self.win = Gtk.OffscreenWindow(); self.win.set_default_size(w, h)
        ctx = WebKit2.WebContext.new_ephemeral()
        self.view = WebKit2.WebView.new_with_context(ctx)
        s = self.view.get_settings(); s.set_enable_javascript(True); s.set_enable_webgl(False); s.set_hardware_acceleration_policy(WebKit2.HardwareAccelerationPolicy.NEVER)
        self.view.set_size_request(w, h); self.win.add(self.view); self.win.show_all()
        self.msgs = []
        self.loaded = False
        self.view.connect('load-changed', self._lc)
    def _lc(self, v, ev):
        if ev == WebKit2.LoadEvent.FINISHED: self.loaded = True
    def pump(self, ms):
        end = time.time() + ms / 1000
        while time.time() < end:
            while Gtk.events_pending(): Gtk.main_iteration_do(False)
            time.sleep(0.01)
    def load(self, url, timeout=30):
        self.loaded = False; self.view.load_uri(url)
        end = time.time() + timeout
        while not self.loaded and time.time() < end: self.pump(50)
        return self.loaded
    def eval(self, code, timeout=15):
        box = {}
        def cb(v, res):
            try: box['v'] = v.evaluate_javascript_finish(res).to_string()
            except Exception as e: box['e'] = str(e)
        self.view.evaluate_javascript('(function(){try{return JSON.stringify((function(){' + code + '})())}catch(e){return JSON.stringify({__err:String(e)})}})()', -1, None, None, None, cb)
        end = time.time() + timeout
        while not box and time.time() < end: self.pump(20)
        if 'e' in box or 'v' not in box: return {'__err': box.get('e', 'timeout')}
        try: return json.loads(box['v']) if box['v'] else None
        except Exception: return box['v']
    def run(self, code, wait=0.0):
        self.eval(code); self.pump(int(wait * 1000))
    def shot(self, path):
        box = {}
        def cb(v, res):
            try: box['s'] = v.get_snapshot_finish(res)
            except Exception as e: box['e'] = str(e)
        self.view.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, None, cb)
        end = time.time() + 15
        while not box and time.time() < end: self.pump(20)
        if 's' in box: box['s'].write_to_png(path); return True
        return False

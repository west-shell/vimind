import { Layout } from "./layout";
class Tianpan extends Layout {
    doLayout(node) {
        if (node.children.length == 0) return;
        var box = node.getContentBox();
        var x, y, Rs, Rm, R0, R;
        var theta = 0;
        Rm = Rs = Math.max(box.width, box.height);
        node.children.forEach(child => {
            box = child.getTreeBox();
            Rm = Math.max(Rm, box.width, box.height)
        });
        R = R0 = (Rs + Rm) / 2;
        node.children.forEach(node => {
            x = R * Math.cos(theta + 2.5) - Rs / 2;
            y = R * Math.sin(theta + 2.5);
            theta += Rm / R
            R = Rm * theta / 6 + R0;
            node.container.position({ x: x, y: y })
        })
    }
}
Layout.register("tianpan", Tianpan);
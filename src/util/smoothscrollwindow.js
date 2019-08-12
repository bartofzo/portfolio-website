import SmoothBoolean from './smoothboolean.js';
import AnimationFrameTail from './animationframetail.js';
import MathHelper from './mathhelper.js';

const SmoothScrollWindow = {
    scrollTo : function(targetElement, duration)
    {
        const startScroll = {
            x : window.scrollX,
            y : window.scrollY
        };
        const rect = targetElement.getBoundingClientRect();
        const targetScroll = {
            x : rect.left + startScroll.x,
            y : rect.top + startScroll.y
        };

        const ani = new AnimationFrameTail(duration, () => {
            const t = smoother.getSmooth(true);
            window.scrollTo(MathHelper.lerp(startScroll.x, targetScroll.x, t), MathHelper.lerp(startScroll.y, targetScroll.y, t));
        });

        const smoother = new SmoothBoolean(duration, ani.getLastNow);
        ani.poke();
    }
}
export default SmoothScrollWindow;
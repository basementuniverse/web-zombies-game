"use strict";
Z.bloodEffect = (function(base) {
	var SIZE = 3,
		MIN_SPEED = 0.2,
		MAX_SPEED = 1,
		GRAVITY = vec2(0, 1),
		GIB_SPEED = 1;
	var _effect = Object.create(base);
	_effect.amount = 0;
	_effect.colour = "";
	_effect.fadeTime = 0;
	_effect.particles = [];
	_effect.gibs = [];
	_effect.gibSprite = null;
	_effect.create = function(position, target, data) {
		var e = base.create.call(this, target, data.name, data.fadeTime, data.soundEffect);
		e.amount = data.amount || e.amount;
		e.colour = data.colour || e.colour;
		e.fadeTime = data.fadeTime || e.fadeTime;
		var velocity = null,
			bloodParticles = [];
		for (var i = e.amount; i--;) {
			velocity = vec2.norm(vec2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
			velocity = vec2.mul(velocity, MIN_SPEED + (Math.random() * (MAX_SPEED - MIN_SPEED)));
			bloodParticles.push({
				position: target,
				velocity: velocity
			});
		}
		e.particles = bloodParticles;
		
		// Add gibs if specified in data
		if (data.gibs) {
			e.gibSprite = Z.sprite.create(Z.content.items["gibs"]);
			var gibParticles = [],
				animation = "";
			for (var i = Math.min(data.gibs, Z.content.items["gibs"].animations.length); i--;) {
				velocity = vec2.norm(vec2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
				velocity = vec2.mul(velocity, GIB_SPEED);
				animation = "gib" + Math.floor(Math.random() * Z.content.items["gibs"].animations.length);
				gibParticles.push({
					position: target,
					velocity: velocity,
					animation: animation
				});
			}
			e.gibs = gibParticles;
		}
		return e;
	};
	_effect.update = function(elapsedTime) {
		base.update.call(this, elapsedTime);
		var delta = this.totalTime / this.fadeTime;
		
		// Update blood particles
		for (var i = this.particles.length; i--;) {
			this.particles[i].velocity = vec2.add(this.particles[i].velocity, vec2.mul(GRAVITY, elapsedTime));
			this.particles[i].position = vec2.add(this.particles[i].position, this.particles[i].velocity);
		}
		
		// Update gibs
		for (var i = this.gibs.length; i--;) {
			this.gibs[i].velocity = vec2.add(this.gibs[i].velocity, vec2.mul(GRAVITY, elapsedTime));
			this.gibs[i].position = vec2.add(this.gibs[i].position, this.gibs[i].velocity);
		}
		
		// Draw blood/gibs onto decals canvas when effect has finished animation (ie. on dispose)
		if (this.dispose) {
			Z.viewArea.drawDecal(this);
			this.particles = [];
		}
	};
	_effect.draw = function(context) {
		for (var i = this.particles.length; i--;) {
			context.save();
			context.fillStyle = this.colour;
			context.beginPath();
			context.arc(
				this.particles[i].position.X,
				this.particles[i].position.Y,
				SIZE / 2, 0, Math.PI * 2, false
			);
			context.closePath();
			context.fill();
			context.restore();
		}
		for (var i = this.gibs.length; i--;) {
			context.save();
			this.gibSprite.animation = this.gibs[i].animation;
			this.gibSprite.draw(context, this.gibs[i].position, vec2(1, 0));
			context.restore();
		}
	};
	return _effect;
}(Z.effect));
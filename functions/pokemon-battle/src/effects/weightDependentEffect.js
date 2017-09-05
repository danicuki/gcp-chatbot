// Generated by CoffeeScript 1.12.7
(function() {
  var DefaultEffect, WeightDependentEffect,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  DefaultEffect = require('./defaultEffect');

  WeightDependentEffect = (function(superClass) {
    extend(WeightDependentEffect, superClass);

    function WeightDependentEffect() {
      return WeightDependentEffect.__super__.constructor.apply(this, arguments);
    }

    WeightDependentEffect.prototype.power = function(base, attacker, defender) {
      if (defender == null) {
        return 60;
      }
      switch (false) {
        case !(defender.weight < 10):
          return 20;
        case !(defender.weight < 25):
          return 40;
        case !(defender.weight < 50):
          return 60;
        case !(defender.weight < 100):
          return 80;
        case !(defender.weight < 200):
          return 100;
        default:
          return 200;
      }
    };

    return WeightDependentEffect;

  })(DefaultEffect);

  module.exports = WeightDependentEffect;

}).call(this);

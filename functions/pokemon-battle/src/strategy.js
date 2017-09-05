// Generated by CoffeeScript 1.12.7
(function() {
  var DamageCalculator, Strategy, Type,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Type = require('./type');

  DamageCalculator = require('./damageCalculator');

  Strategy = (function() {
    function Strategy(pokemon) {
      var i, len, ref, type, weakness;
      this.pokemon = pokemon;
      this.helpfulTypes = [];
      ref = (function() {
        var j, len, ref, results;
        ref = Type.all();
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          type = ref[j];
          if (type.effectiveAgainst(this.pokemon.types)) {
            results.push(type);
          }
        }
        return results;
      }).call(this);
      for (i = 0, len = ref.length; i < len; i++) {
        weakness = ref[i];
        this.helpfulTypes = this.helpfulTypes.concat((function() {
          var j, len1, ref1, results;
          ref1 = Type.all();
          results = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            type = ref1[j];
            if (type.effectiveAgainst(weakness)) {
              results.push(type.id);
            }
          }
          return results;
        })());
      }
    }

    Strategy.prototype.chooseBuild = function(moves) {
      var chosenMoves, i, j, len, len1, move, ref, scoredMoves, typesCovered;
      scoredMoves = [];
      for (i = 0, len = moves.length; i < len; i++) {
        move = moves[i];
        if (move.banned()) {
          continue;
        }
        this.scoreMoveForBuild(move);
        scoredMoves.push(move);
      }
      scoredMoves.sort(function(a, b) {
        return b.score - a.score;
      });
      chosenMoves = [];
      typesCovered = [];
      for (j = 0, len1 = scoredMoves.length; j < len1; j++) {
        move = scoredMoves[j];
        if (ref = move.type.id, indexOf.call(typesCovered, ref) < 0) {
          chosenMoves.push(move);
          typesCovered.push(move.type.id);
          if (typesCovered.length === 4) {
            break;
          }
        }
      }
      if (chosenMoves.length === 0) {
        chosenMoves = [Move.Struggle];
      }
      return chosenMoves;
    };

    Strategy.prototype.scoreMoveForBuild = function(move) {
      var stat, typeMultiplier;
      typeMultiplier = (function() {
        var ref, ref1;
        switch (false) {
          case ref = move.type.id, indexOf.call(this.pokemon.types.map(function(type) {
              return type.id;
            }), ref) < 0:
            return 1.5;
          case ref1 = move.type.id, indexOf.call(this.helpfulTypes, ref1) < 0:
            return 1.2;
          default:
            switch (move.type.strengths().length) {
              case 0:
              case 1:
              case 2:
                return 0.9;
              case 3:
                return 1;
              default:
                return 1.1;
            }
        }
      }).call(this);
      stat = this.pokemon.stat(move.attackStat());
      return move.score = move.power(this.pokemon) * typeMultiplier * stat * move.accuracy * move.buildMultiplier(this.pokemon);
    };

    Strategy.prototype.chooseMove = function(defender) {
      var bestDamage, bestMove, damage, damageCalculator, i, len, move, ref;
      damageCalculator = new DamageCalculator;
      bestMove = null;
      bestDamage = -1;
      ref = this.pokemon.moves;
      for (i = 0, len = ref.length; i < len; i++) {
        move = ref[i];
        damage = damageCalculator.calculate(move, this.pokemon, defender);
        if (defender.hp < damage) {
          damage = defender.hp;
        }
        damage *= move.battleMultiplier(this.pokemon, defender, damage);
        if (damage > bestDamage) {
          bestMove = move;
          bestDamage = damage;
        }
      }
      return this.pokemon.move = bestMove;
    };

    return Strategy;

  })();

  module.exports = Strategy;

}).call(this);

// Generated by CoffeeScript 1.12.7
(function() {
  var Battle, DamageCalculator, Log, Move, Pokemon, Type;

  Type = require('./type');

  Move = require('./move');

  Pokemon = require('./pokemon');

  Log = require('./log');

  DamageCalculator = require('./damageCalculator');

  Battle = (function() {
    function Battle(trainer1, trainer2) {
      var i, j, len, len1, pokemon, ref, ref1;
      this.trainer1 = trainer1;
      this.trainer2 = trainer2;
      this.damageCalculator = new DamageCalculator;
      this.trainer1.firstPokemon();
      this.trainer2.firstPokemon();
      ref = this.trainer1.team;
      for (i = 0, len = ref.length; i < len; i++) {
        pokemon = ref[i];
        pokemon.subscribeToFaint(this);
      }
      ref1 = this.trainer2.team;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        pokemon = ref1[j];
        pokemon.subscribeToFaint(this);
      }
    }

    Battle.prototype.start = function() {
      var i, len, loser, pokemon, ref;
      this.log = new Log;
      this.winner = null;
      while (this.winner == null) {
        this.nextTurn();
      }
      loser = this.winner === this.trainer1 ? this.trainer2 : this.trainer1;
      this.log.message(this.winner.mainPokemon + " defeated " + loser.mainPokemon + "!");
      ref = this.winner.team;
      for (i = 0, len = ref.length; i < len; i++) {
        pokemon = ref[i];
        this.log.message(pokemon.name + ": " + pokemon.hp + " HP left.");
      }
      return this.log;
    };

    Battle.prototype.nextTurn = function() {
      var attacker, defender, newPokemon1, newPokemon2, pkmn1GoesFirst, pokemon1, pokemon2;
      pokemon1 = this.trainer1.mainPokemon;
      pokemon2 = this.trainer2.mainPokemon;
      pokemon1.chooseMove(pokemon2);
      pokemon2.chooseMove(pokemon1);
      if (!((pokemon1.move != null) && (pokemon2.move != null))) {
        throw new Error("One of the pokemon doesn't have an attack move.");
      }
      newPokemon1 = pokemon1.trainer.maybeSwitchOut(pokemon1, pokemon2, this.log);
      newPokemon2 = pokemon2.trainer.maybeSwitchOut(pokemon2, pokemon1, this.log);
      pokemon1 = newPokemon1;
      pokemon2 = newPokemon2;
      if (!((pokemon1.move != null) && (pokemon2.move != null))) {
        pkmn1GoesFirst = true;
      } else if (pokemon1.move.priority === pokemon2.move.priority) {
        pkmn1GoesFirst = pokemon1.speed() > pokemon2.speed() || (pokemon1.speed() === pokemon2.speed() && Math.random() < 0.5);
      } else {
        pkmn1GoesFirst = pokemon1.move.priority > pokemon2.move.priority;
      }
      if (pkmn1GoesFirst) {
        attacker = pokemon1;
        defender = pokemon2;
      } else {
        attacker = pokemon2;
        defender = pokemon1;
      }
      if (attacker.move != null) {
        this.doAttack(attacker, defender);
      }
      attacker = attacker.trainer.mainPokemon;
      defender = defender.trainer.mainPokemon;
      if ((defender.move != null) && !this.winner) {
        this.doAttack(defender, attacker);
      }
      if (attacker.isAlive() && !this.winner) {
        attacker.endTurn(this.log);
      }
      if (defender.isAlive() && !this.winner) {
        defender.endTurn(this.log);
      }
      return this.log.endTurn();
    };

    Battle.prototype.doAttack = function(attacker, defender) {
      var critical, damage, effectiveness, hit, hits, miss, random;
      if (attacker.canAttack(this.log)) {
        this.log.message(attacker.trainerAndName() + " used " + attacker.move.name + "!");
        effectiveness = attacker.move.effectiveness(attacker, defender);
        miss = false;
        if (effectiveness === 0) {
          this.log.message("It doesn't affect " + defender.trainerAndName() + "...");
          miss = true;
        } else {
          if (Math.random() * 100 > attacker.move.accuracy) {
            this.log.message(attacker.trainerAndName() + "'s attack missed!");
            miss = true;
          } else {
            hits = attacker.move.hits();
            hit = 0;
            miss = false;
            this.stopMultiHit = false;
            while (!((hit++ === hits) || this.stopMultiHit)) {
              critical = Math.random() < this.criticalChance(attacker.move.criticalRateStage());
              random = Math.random() * (1 - 0.85) + 0.85;
              damage = this.damageCalculator.calculate(attacker.move, attacker, defender, critical, random);
              defender.takeDamage(damage, "%(pokemon) was hit for %(damage)", this.log);
              attacker.move.afterDamage(attacker, defender, damage, this.log);
            }
          }
        }
        if (miss) {
          attacker.move.afterMiss(attacker, defender, this.log);
        }
      }
      return this.log.endAttack();
    };

    Battle.prototype.notifyFaint = function(pokemon) {
      var otherTrainer;
      this.log.message(pokemon.trainerAndName() + " fainted!");
      this.stopMultiHit = true;
      otherTrainer = pokemon.trainer === this.trainer1 ? this.trainer2 : this.trainer1;
      if (pokemon.trainer.ablePokemon().length === 0) {
        if (!this.winner) {
          this.winner = otherTrainer;
        }
      }
      if (!this.winner) {
        return pokemon.trainer.switchPokemon(otherTrainer.mainPokemon, this.log);
      }
    };

    Battle.prototype.criticalChance = function(stage) {
      switch (stage) {
        case 0:
          return 1 / 16;
        case 1:
          return 1 / 8;
        case 2:
          return 1 / 2;
        default:
          return 1;
      }
    };

    return Battle;

  })();

  module.exports = Battle;

}).call(this);

//# sourceMappingURL=battle.js.map

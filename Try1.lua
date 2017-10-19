local card = {Name="Abandon Reason";
SetCode="EMN";
Manacost="{{2}}{{R}}";
cmc=3;
Colors={"Red"};
Type="Instant";
Types={"Instant"};
Rarity="Uncommon";
Text=[=[Up to two target creatures each get +1/+0 and gain first strike until end of turn.<br/>
Madness {{1}}{{R}} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)]=];
Artist="Josh Hass";
CardNumber="115";
MultiverseID=414412;
Rulings= {
	{Date="2016-07-13";Text=[=[You can't target the same creature twice to have it get +2/+0.]=];};
};
};

local aaa = card.Rarity .. card.CardNumber

print (card.Rarity)
print (card.Something)
print (aaa)
print (card.Colors[1])
print("=====");

local card2 = {Name="Fevered Visions";
SetCode="SOI";
Manacost="{{1}}{{U}}{{R}}";
cmc=3;
Colors={"Blue";"Red";};
Type="Enchantment";
Types={"Enchantment"};
Rarity="Rare";
Text=[=[At the beginning of each player's end step, that player draws a card. If the player is your opponent and has four or more cards in hand, Fevered Visions deals 2 damage to him or her.]=];
Flavor=[=[The mind can only expand so far before it flies apart.]=];
Artist="Steven Belledin";
CardNumber="244";
MultiverseID=410009;
Rulings= {
	{Date="2016-04-08";Text=[=[No player may take any action in between the two steps of Fevered Visions's triggered ability, so if your opponent has four or more cards in hand after drawing a card, Fevered Visions will deal 2 damage to that player.]=];};
};
};

print(#card2.Colors)

import gate from './';
import inviteRule from './rules/Invite.rule';
import deleteGroupRule from './rules/DeleteGroup.rule';
import leaveRule from './rules/Leave.rule';
import deleteMessageRule from './rules/DeleteMessage.rule';


gate.addRule('invite', inviteRule);
gate.addRule('deleteGroup', deleteGroupRule);
gate.addRule('leave', leaveRule);
gate.addRule('deleteMessage', deleteMessageRule);

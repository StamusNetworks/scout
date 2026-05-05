import { RuleVersion } from '../../model/rule';
import { getRuleData } from './rule-analysis.utils';

describe('Grabbing IPs', () => {
  it.each`
    case                        | content                                                                                                                                                                                                       | client_ip                   | client_port        | server_ip                     | server_port
    ${'String'}                 | ${'alert smb 10.136.21.31 any -> $HOME_NET 445 (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement";)\n'}                                                            | ${'10.136.21.31'}           | ${'any'}           | ${'$HOME_NET'}                | ${'445'}
    ${'Grouping'}               | ${'alert smb [10.0.0.0,10.0.0.2] [91,82] <> [$HOME_NET,231.32.234.43] [85,28] (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement";)\n'}                             | ${'10.0.0.0, 10.0.0.2'}     | ${'91, 82'}        | ${'$HOME_NET, 231.32.234.43'} | ${'85, 28'}
    ${'Range'}                  | ${'alert smb 10.0.0.0/24 [80:82] => 10.0.0.0/8 [1024:] (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement";)\n'}                                                    | ${'10.0.0.0/24'}            | ${'80:82'}         | ${'10.0.0.0/8'}               | ${'1024:'}
    ${'Exceptions'}             | ${'alert smb [10.0.0.0/24,!10.0.0.5] [80:100,!99] -> ![1.1.1.1,1.1.1.2] [1:80,![2,4]] (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement";)\n'}                     | ${'10.0.0.0/24, !10.0.0.5'} | ${'80:100, !99'}   | ${'![1.1.1.1, 1.1.1.2]'}      | ${'1:80, ![2, 4]'}
    ${'Nested brackets'}        | ${'alert smb [10.0.0.0/24,!10.0.0.5] [1:80,![2,4]] <> ![1.1.1.1,1.1.1.2] [1:80,![2,4],8000] (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement";)\n'}               | ${'10.0.0.0/24, !10.0.0.5'} | ${'1:80, ![2, 4]'} | ${'![1.1.1.1, 1.1.1.2]'}      | ${'1:80, ![2, 4], 8000'}
    ${'Deeply nested brackets'} | ${'alert smb [10.0.0.0/24,!10.0.0.5] [1:80,![2,4]] => ![1.1.1.1,1.1.1.2] [1:80,![2,4,[1:80,![2,4]]],8000] (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement";)\n'} | ${'10.0.0.0/24, !10.0.0.5'} | ${'1:80, ![2, 4]'} | ${'![1.1.1.1, 1.1.1.2]'}      | ${'1:80, ![2, 4, [1:80, ![2, 4]]], 8000'}
  `(
    'Should handle case: $case',
    ({ content, client_ip, client_port, server_ip, server_port }) => {
      const rule = getRuleData({
        ...dummyRule,
        content,
      });
      expect(rule.generalData.originIp).toEqual(client_ip);
      expect(rule.generalData.originPort).toEqual(client_port);
      expect(rule.generalData.destinationIp).toEqual(server_ip);
      expect(rule.generalData.destinationPort).toEqual(server_port);
    },
  );
});

const dummyRule: RuleVersion = {
  id: 304917,
  analysis: {
    id: 2025722,
    gid: 1,
    rev: 2,
    msg: 'ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement',
    app_proto: 'smb',
    requirements: ['payload', 'flow'],
    type: 'pkt_stream',
    flags: [
      'src_any',
      'sp_any',
      'applayer',
      'need_packet',
      'need_stream',
      'toserver',
      'prefilter',
    ],
    pkt_engines: [
      {
        name: 'payload',
        is_mpm: true,
      },
      {
        name: 'packet',
        is_mpm: false,
      },
    ],
    frame_engines: [],
    engines: [
      {
        name: 'payload',
        direction: 'toserver',
        is_mpm: true,
        app_proto: 'smb',
        progress: 0,
        transforms: [],
        matches: [
          {
            name: 'content',
            content: {
              pattern: '|00|p|00|o|00|w|00|e|00|r|00|s|00|h|00|e|00|l|00|l|00|',
              length: 21,
              nocase: true,
              negated: false,
              starts_with: false,
              ends_with: false,
              is_mpm: true,
              no_double_inspect: false,
              fast_pattern: true,
              relative_next: true,
            },
          },
        ],
      },
      {
        name: 'packet',
        direction: 'toserver',
        is_mpm: false,
        app_proto: 'smb',
        progress: 0,
        transforms: [],
        matches: [],
      },
    ],
    mpm: {
      buffer: 'payload',
      content: {
        content: {
          pattern: '|00|p|00|o|00|w|00|e|00|r|00|s|00|h|00|e|00|l|00|l|00|',
          length: 21,
          nocase: true,
          negated: false,
          starts_with: false,
          ends_with: false,
          is_mpm: true,
          no_double_inspect: false,
          fast_pattern: true,
          relative_next: true,
        },
      },
    },
    lists: {
      packet: {
        matches: [
          {
            name: 'flow',
            flow: {
              to_server: true,
              to_client: false,
              established: true,
              not_established: false,
              stateless: false,
              only_stream: false,
              no_stream: false,
              no_frag: false,
              only_frag: false,
            },
          },
        ],
      },
      payload: {
        matches: [
          {
            name: 'content',
            content: {
              pattern: 'SMB',
              length: 3,
              nocase: false,
              negated: false,
              starts_with: false,
              ends_with: false,
              is_mpm: false,
              no_double_inspect: false,
              fast_pattern: false,
              relative_next: true,
            },
          },
          {
            name: 'content',
            content: {
              pattern: '|00|p|00|o|00|w|00|e|00|r|00|s|00|h|00|e|00|l|00|l|00|',
              length: 21,
              nocase: true,
              negated: false,
              starts_with: false,
              ends_with: false,
              is_mpm: true,
              no_double_inspect: false,
              fast_pattern: true,
              relative_next: true,
            },
          },
          {
            name: 'content',
            content: {
              pattern: '|00|n|00|o|00|p|00|',
              length: 7,
              nocase: true,
              negated: false,
              starts_with: false,
              ends_with: false,
              is_mpm: false,
              no_double_inspect: false,
              fast_pattern: false,
              relative_next: false,
            },
          },
        ],
      },
    },
  },
  contentHtml:
    '<div class="highlight"><pre><span></span><span class="kt">alert</span><span class="w"> </span><span class="err">smb</span><span class="w"> </span><span class="nv">any</span><span class="w"> </span><span class="nv">any</span><span class="w"> </span><span class="o">-&gt;</span><span class="w"> </span><span class="nv">$HOME_NET</span><span class="w"> </span><span class="m">445</span><span class="w"> </span><span class="err">(</span><span class="k">msg:</span><span class="s">&quot;ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement&quot;</span><span class="p">;</span><span class="w"> </span><span class="k">flow:</span><span class="na">established</span><span class="err">,</span><span class="na">to_server</span><span class="p">;</span><span class="w"> </span><span class="k">content:</span><span class="s">&quot;SMB&quot;</span><span class="p">;</span><span class="w"> </span><span class="k">depth:</span><span class="m">8</span><span class="p">;</span><span class="w"> </span><span class="k">content:</span><span class="s">&quot;</span><span class="mh">|00|</span><span class="s">p</span><span class="mh">|00|</span><span class="s">o</span><span class="mh">|00|</span><span class="s">w</span><span class="mh">|00|</span><span class="s">e</span><span class="mh">|00|</span><span class="s">r</span><span class="mh">|00|</span><span class="s">s</span><span class="mh">|00|</span><span class="s">h</span><span class="mh">|00|</span><span class="s">e</span><span class="mh">|00|</span><span class="s">l</span><span class="mh">|00|</span><span class="s">l</span><span class="mh">|00|</span><span class="s">&quot;</span><span class="p">;</span><span class="w"> </span><span class="na">nocase</span><span class="p">;</span><span class="w"> </span><span class="k">distance:</span><span class="m">0</span><span class="p">;</span><span class="w"> </span><span class="na">fast_pattern</span><span class="p">;</span><span class="w"> </span><span class="k">content:</span><span class="s">&quot;</span><span class="mh">|00|</span><span class="s">n</span><span class="mh">|00|</span><span class="s">o</span><span class="mh">|00|</span><span class="s">p</span><span class="mh">|00|</span><span class="s">&quot;</span><span class="p">;</span><span class="w"> </span><span class="na">nocase</span><span class="p">;</span><span class="w"> </span><span class="k">distance:</span><span class="m">0</span><span class="p">;</span><span class="w"> </span><span class="k">classtype:</span><span class="err">trojan-activity</span><span class="p">;</span><span class="w"> </span><span class="k">sid:</span><span class="m">2025722</span><span class="p">;</span><span class="w"> </span><span class="k">rev:</span><span class="m">2</span><span class="p">;</span><span class="w"> </span><span class="k">metadata:</span><span class="nv">attack_target</span><span class="w"> </span><span class="na">SMB_Client</span><span class="err">,</span><span class="w"> </span><span class="nv">created_at</span><span class="w"> </span><span class="na">2018_07_17</span><span class="err">,</span><span class="w"> </span><span class="nv">deployment</span><span class="w"> </span><span class="na">Perimeter</span><span class="err">,</span><span class="w"> </span><span class="nv">deployment</span><span class="w"> </span><span class="na">Internal</span><span class="err">,</span><span class="w"> </span><span class="nv">performance_impact</span><span class="w"> </span><span class="na">Low</span><span class="err">,</span><span class="w"> </span><span class="nv">confidence</span><span class="w"> </span><span class="na">High</span><span class="err">,</span><span class="w"> </span><span class="nv">signature_severity</span><span class="w"> </span><span class="na">Major</span><span class="err">,</span><span class="w"> </span><span class="nv">updated_at</span><span class="w"> </span><span class="na">2019_07_26</span><span class="err">,</span><span class="w"> </span><span class="nv">mitre_tactic_id</span><span class="w"> </span><span class="na">TA0008</span><span class="err">,</span><span class="w"> </span><span class="nv">mitre_tactic_name</span><span class="w"> </span><span class="na">Lateral_Movement</span><span class="err">,</span><span class="w"> </span><span class="nv">mitre_technique_id</span><span class="w"> </span><span class="na">T1570</span><span class="err">,</span><span class="w"> </span><span class="nv">mitre_technique_name</span><span class="w"> </span><span class="na">Lateral_Tool_Transfer</span><span class="p">;</span><span class="err">)</span>\n</pre></div>\n',
  rev: 2,
  version: 0,
  content:
    'alert smb any any -> $HOME_NET 445 (msg:"ET INFO Powershell Command With No Profile Argument Over SMB - Likely Lateral Movement"; flow:established,to_server; content:"SMB"; depth:8; content:"|00|p|00|o|00|w|00|e|00|r|00|s|00|h|00|e|00|l|00|l|00|"; nocase; distance:0; fast_pattern; content:"|00|n|00|o|00|p|00|"; nocase; distance:0; classtype:trojan-activity; sid:2025722; rev:2; metadata:attack_target SMB_Client, created_at 2018_07_17, deployment Perimeter, deployment Internal, performance_impact Low, confidence High, signature_severity Major, updated_at 2019_07_26, mitre_tactic_id TA0008, mitre_tactic_name Lateral_Movement, mitre_technique_id T1570, mitre_technique_name Lateral_Tool_Transfer;)\n',
  state: true,
  isCommentedInSource: false,
  importedAt: '2025-07-02T03:51:42.349478+02:00',
  importedAtMeta: '2025-07-02T03:51:42.349478+02:00',
  createdAt: '2018-07-17',
  updatedAt: '2019-07-26',
};
